import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { Appointment } from '../types';
import { MicIcon } from '../components/icons/MicIcon';
import { MicOffIcon } from '../components/icons/MicOffIcon';
import { VideoIcon } from '../components/icons/VideoIcon';
import { VideoOffIcon } from '../components/icons/VideoOffIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { ShieldExclamationIcon } from '../components/icons/ShieldExclamationIcon';
import firebase from 'firebase/compat/app';

type ErrorState = {
    type: 'permission' | 'context' | 'not_found' | 'generic' | 'unsupported' | 'in_use' | 'auth';
    message: string;
};

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

const VideoCallPage: React.FC = () => {
    const { hospitalId, appointmentId } = useParams<{ hospitalId: string; appointmentId: string }>();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ErrorState | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMeetingJoined, setIsMeetingJoined] = useState(false);
    const [remoteUserJoined, setRemoteUserJoined] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const roleRef = useRef<'caller' | 'callee' | null>(null);

    const localUser = JSON.parse(localStorage.getItem('doctorProfile') || localStorage.getItem('patientProfile') || 'null');
    const isDoctor = !!localStorage.getItem('doctorProfile');

    const setupWebRTC = async () => {
        if (!hospitalId || !appointmentId) return;

        peerConnectionRef.current = new RTCPeerConnection(servers);
        const pc = peerConnectionRef.current;
        const callDocRef = db.collection('users').doc(hospitalId).collection('appointments').doc(appointmentId).collection('webrtc').doc('signaling');
        const callerCandidatesCollection = callDocRef.collection('callerCandidates');
        const calleeCandidatesCollection = callDocRef.collection('calleeCandidates');

        streamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, streamRef.current!);
        });

        pc.ontrack = (event) => {
            setRemoteUserJoined(true);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidatesCollection = roleRef.current === 'caller' ? callerCandidatesCollection : calleeCandidatesCollection;
                candidatesCollection.add(event.candidate.toJSON());
            }
        };

        await db.runTransaction(async (transaction) => {
            const callDoc = await transaction.get(callDocRef);
            if (!callDoc.exists) {
                roleRef.current = 'caller';
                transaction.set(callDocRef, { initiator: localUser.uid || localUser.id });
            } else {
                roleRef.current = 'callee';
            }
        });

        if (roleRef.current === 'caller') {
            const [callerCandidates, calleeCandidates] = await Promise.all([
                callerCandidatesCollection.get(),
                calleeCandidatesCollection.get()
            ]);
            const batch = db.batch();
            callerCandidates.forEach(doc => batch.delete(doc.ref));
            calleeCandidates.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);
            await callDocRef.set({ offer: { type: offerDescription.type, sdp: offerDescription.sdp } });

            callDocRef.onSnapshot(async (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.answer) {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });

            calleeCandidatesCollection.onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                });
            });

        } else { // Callee logic
            const unsubscribeOffer = callDocRef.onSnapshot(async (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.offer) {
                    unsubscribeOffer();
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answerDescription = await pc.createAnswer();
                    await pc.setLocalDescription(answerDescription);
                    await callDocRef.update({ answer: { type: answerDescription.type, sdp: answerDescription.sdp } });
                }
            });

            callerCandidatesCollection.onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                });
            });
        }
    };
    
    const cleanup = async () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (isDoctor && hospitalId && appointmentId) {
            try {
                const signalingDocRef = db.collection('users').doc(hospitalId).collection('appointments').doc(appointmentId).collection('webrtc').doc('signaling');

                const [signalingDoc, callerCandidates, calleeCandidates] = await Promise.all([
                    signalingDocRef.get(),
                    signalingDocRef.collection('callerCandidates').get(),
                    signalingDocRef.collection('calleeCandidates').get(),
                ]);

                const batch = db.batch();
                callerCandidates.forEach(doc => batch.delete(doc.ref));
                calleeCandidates.forEach(doc => batch.delete(doc.ref));
                if(signalingDoc.exists) batch.delete(signalingDocRef);
                await batch.commit();
            } catch (e) {
                console.error("Error cleaning up call data:", e);
            }
        }
    };

    useEffect(() => {
        const fetchAppointment = async () => {
            if (!hospitalId || !appointmentId) {
                setError({ type: 'generic', message: 'Invalid meeting link.'});
                return;
            }
            try {
                const doc = await db.collection('users').doc(hospitalId).collection('appointments').doc(appointmentId).get();
                if (!doc.exists) throw new Error('Appointment not found.');
                const appData = doc.data() as Appointment;
                if (!localUser || ((isDoctor && localUser.id !== appData.doctorId) || (!isDoctor && localUser.uid !== appData.authUid))) {
                    throw new Error('You do not have permission to join this meeting.');
                }
                setAppointment(appData);
            } catch (err: any) {
                if (err.code === 'permission-denied') {
                    setError({ type: 'auth', message: 'Permission Denied. Please ensure your Firestore security rules allow access to appointments and their subcollections.' });
                } else {
                    setError({ type: 'auth', message: err.message || 'Failed to load meeting details.' });
                }
            }
        };

        const checkAndStartMedia = async () => {
            try {
                if (!window.isSecureContext) throw { type: 'context', message: "Camera and microphone access requires a secure connection (HTTPS)." };
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw { type: 'unsupported', message: "Your browser does not support video calls." };
                
                const cameraPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
                const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                if (cameraPerm.state === 'denied' || micPerm.state === 'denied') throw { type: 'permission', message: 'Camera and microphone access was denied. You must enable it in your browser or device settings.'};
                
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                stream.getAudioTracks().forEach(track => track.enabled = false);
                setIsMicOn(false);
            } catch (err: any) {
                console.error("Error accessing media devices.", err);
                if (err.type) setError(err);
                else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') setError({ type: 'permission', message: 'Camera and microphone access was denied.' });
                else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') setError({ type: 'not_found', message: 'No camera or microphone found on your device.' });
                else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') setError({ type: 'in_use', message: 'Your camera or microphone might be in use by another application.' });
                else setError({ type: 'generic', message: err.message || 'Could not access camera or microphone.'});
            }
        };

        Promise.all([fetchAppointment(), checkAndStartMedia()]).finally(() => setIsLoading(false));
        return () => { cleanup(); };
    }, [hospitalId, appointmentId]);

    useEffect(() => {
        if (isMeetingJoined) {
            if (localVideoRef.current && streamRef.current) {
                localVideoRef.current.srcObject = streamRef.current;
            }

            setupWebRTC().catch(e => {
                console.error("WebRTC setup failed:", e);
                setError({ type: 'generic', message: 'Could not initiate the call. Please refresh and try again.' });
                setIsMeetingJoined(false);
            });
        }
    }, [isMeetingJoined]);

    const toggleMic = () => {
        streamRef.current?.getAudioTracks().forEach(track => { track.enabled = !isMicOn; });
        setIsMicOn(!isMicOn);
    };

    const toggleCamera = () => {
        streamRef.current?.getVideoTracks().forEach(track => { track.enabled = !isCameraOn; });
        setIsCameraOn(!isCameraOn);
    };

    const handleJoinMeeting = () => {
        if (streamRef.current && !isMicOn) {
            streamRef.current.getAudioTracks().forEach(track => { track.enabled = true; });
            setIsMicOn(true);
        }
        setIsMeetingJoined(true);
    };

    const handleEndCall = () => {
        cleanup();
        if (isDoctor && appointment) navigate(`/${localUser.subdomain}/doctor-portal/dashboard`);
        else navigate('/patient/dashboard/appointments');
    };
    
    const otherParticipantName = isDoctor ? appointment?.patientName : appointment?.doctorName;

    const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; }> = ({ onClick, children, className = '' }) => (
        <button onClick={onClick} className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${className}`}>
            {children}
        </button>
    );

    const renderError = () => {
        if (!error) return null;
        let title = "An Error Occurred", subtext = "Please try refreshing the page.", icon = <VideoOffIcon className="h-6 w-6 text-red-400" />;
        switch(error.type) {
            case 'permission': title = "Permissions Required"; subtext = "After enabling permissions, please refresh the page."; break;
            case 'context': title = "Secure Connection Required"; subtext = "Video calls require a secure (HTTPS) connection."; icon = <ShieldExclamationIcon className="h-8 w-8 text-amber-400" />; break;
            case 'unsupported': title = "Browser Not Supported"; subtext = "Please use a modern browser like Chrome or Firefox."; break;
            case 'not_found': title = "Device Not Found"; subtext = "Please ensure your camera/microphone are connected."; break;
            case 'in_use': title = "Device In Use"; subtext = "Another application may be using your camera/microphone."; break;
            case 'auth': title = "Access Denied"; subtext = "You may not have permission to join this meeting."; break;
        }
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-900">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">{icon}</div>
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className={`${error.type === 'context' ? 'text-amber-300' : 'text-red-400'} font-semibold max-w-md`}>{error.message}</p>
                <p className="text-gray-400 text-sm mt-2 max-w-md">{subtext}</p>
                <button onClick={() => navigate('/')} className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors">Go Home</button>
            </div>
        );
    };

    const renderLobby = () => (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 bg-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2">Ready to join?</h2>
            <div className="w-full max-w-xl aspect-video bg-black rounded-lg relative overflow-hidden shadow-2xl">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                {!isCameraOn && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <UserCircleIcon className="h-24 w-24 text-gray-600"/><p className="absolute bottom-4 text-sm text-white">Camera is off</p>
                    </div>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <ControlButton onClick={toggleMic} className={isMicOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-500'}>{isMicOn ? <MicIcon className="h-6 w-6"/> : <MicOffIcon className="h-6 w-6"/>}</ControlButton>
                    <ControlButton onClick={toggleCamera} className={isCameraOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-500'}>{isCameraOn ? <VideoIcon className="h-6 w-6"/> : <VideoOffIcon className="h-6 w-6"/>}</ControlButton>
                </div>
            </div>
            <button onClick={handleJoinMeeting} className="bg-primary mt-4 px-8 py-3 rounded-full font-semibold hover:bg-primary-700 text-lg transition-transform hover:scale-105">Join Now</button>
        </div>
    );

    const renderMeeting = () => (
        <>
            <div className="flex-1 bg-gray-800 relative flex items-center justify-center overflow-hidden">
               <video ref={remoteVideoRef} autoPlay playsInline className={`absolute w-full h-full object-cover transition-opacity duration-500 ${remoteUserJoined ? 'opacity-100' : 'opacity-0'}`} />
               {!remoteUserJoined && (
                   <div className="text-center z-10 p-4 bg-black/30 rounded-lg">
                        <UserCircleIcon className="h-32 w-32 text-gray-600" />
                        <p className="mt-4 text-xl text-gray-400">Waiting for {otherParticipantName || 'other participant'}...</p>
                   </div>
               )}
            </div>
            <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-black rounded-lg shadow-lg overflow-hidden border-2 border-gray-700">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                {!isCameraOn && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><VideoOffIcon className="h-8 w-8 text-white"/></div>}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
                <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-full flex items-center gap-4">
                    <ControlButton onClick={toggleMic} className={isMicOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}>{isMicOn ? <MicIcon className="h-6 w-6"/> : <MicOffIcon className="h-6 w-6"/>}</ControlButton>
                    <ControlButton onClick={toggleCamera} className={isCameraOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}>{isCameraOn ? <VideoIcon className="h-6 w-6"/> : <VideoOffIcon className="h-6 w-6"/>}</ControlButton>
                    <ControlButton onClick={handleEndCall} className="bg-red-600 hover:bg-red-500 transform rotate-[135deg]"><PhoneIcon className="h-6 w-6"/></ControlButton>
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        if (isLoading) return <div className="flex-1 flex items-center justify-center">Loading meeting...</div>;
        if (error) return renderError();
        if (!isMeetingJoined) return renderLobby();
        return renderMeeting();
    };

    return (
        <div className="w-full h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
            {renderContent()}
        </div>
    );
};

export default VideoCallPage;
