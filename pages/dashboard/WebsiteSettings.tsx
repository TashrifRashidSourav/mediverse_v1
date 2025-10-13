import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { SiteSettings, ServiceItem, Testimonial, PlanTier, SocialLink } from '../../types';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { EyeIcon } from '../../components/icons/EyeIcon';
import PermissionGuide from '../../components/dashboard/PermissionGuide';

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const imageResizer = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

const PlanBadge: React.FC<{ plan: PlanTier }> = ({ plan }) => {
    const planStyles = {
        [PlanTier.General]: 'bg-slate-100 text-slate-700',
        [PlanTier.Premium]: 'bg-blue-100 text-blue-700',
        [PlanTier.Golden]: 'bg-amber-100 text-amber-700',
    };
    return (
        <span className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${planStyles[plan]}`}>
            {plan} Plan
        </span>
    );
}

const WebsiteSettings: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings>({
        themeColor: '#0D9488',
        buttonColor: '#0D9488',
        textColor: '#334155',
        footerColor: '#1e293b',
        logoUrl: '',
        heroImageUrl: '',
        aboutUs: '',
        contactPhone: '',
        contactEmail: '',
        address: '',
        services: [],
        testimonials: [],
        socialLinks: [],
    });
    
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [userPlan, setUserPlan] = useState<PlanTier>(PlanTier.General);
    const [isLoading, setIsLoading] = useState(true);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setHospitalId(currentUser.uid);
            const storedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            if (storedProfile.uid === currentUser.uid) {
                setSubdomain(storedProfile.subdomain);
            }
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        if (!hospitalId) return;
        setIsLoading(true);
        setPermissionError(false);
        try {
            const userDoc = await db.collection('users').doc(hospitalId).get();
            if (userDoc.exists) {
                setUserPlan(userDoc.data()?.plan || PlanTier.General);
            }
            const settingsDoc = await db.collection('users').doc(hospitalId).collection('settings').doc('site').get();
            if (settingsDoc.exists) {
                const data = settingsDoc.data() as SiteSettings;
                setSettings(prev => ({...prev, ...data}));
                if (data.logoUrl) setLogoPreview(data.logoUrl);
                if (data.heroImageUrl) setHeroImagePreview(data.heroImageUrl);
            }
        } catch (error: any) {
             if (error.code === 'permission-denied') setPermissionError(true);
             else console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [hospitalId]);

    useEffect(() => {
        if (hospitalId) fetchSettings();
    }, [hospitalId, fetchSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const resizedDataUrl = await imageResizer(file, type === 'logo' ? 200 : 1920, type === 'logo' ? 200 : 1080);
            if (type === 'logo') {
                setLogoPreview(resizedDataUrl);
                setSettings(prev => ({...prev, logoUrl: resizedDataUrl }));
            } else {
                setHeroImagePreview(resizedDataUrl);
                setSettings(prev => ({...prev, heroImageUrl: resizedDataUrl }));
            }
        }
    };

    const handleListChange = <T extends {id: string}>(listName: 'services' | 'testimonials' | 'socialLinks', index: number, field: keyof T, value: string) => {
        setSettings(prev => {
            const newList = [...(prev[listName] as unknown as T[])];
            newList[index] = { ...newList[index], [field]: value as any };
            return { ...prev, [listName]: newList };
        });
    };
    
    const addListItem = (listName: 'services' | 'testimonials' | 'socialLinks') => {
        let newItem;
        if (listName === 'services') newItem = { id: generateId(), name: '', description: ''};
        else if (listName === 'testimonials') newItem = {id: generateId(), patientName: '', quote: ''};
        else newItem = {id: generateId(), platform: 'Facebook', url: ''};
        
        setSettings(prev => ({ ...prev, [listName]: [...(prev[listName] as any[]), newItem] }));
    };

    const removeListItem = (listName: 'services' | 'testimonials' | 'socialLinks', index: number) => {
        setSettings(prev => ({ ...prev, [listName]: (prev[listName] as any[]).filter((_, i) => i !== index) }));
    };
    
    const handleSave = async () => {
        if (!hospitalId) return;
        setIsSaving(true);
        try {
            await db.collection('users').doc(hospitalId).collection('settings').doc('site').set(settings, { merge: true });
            alert("Settings saved successfully!");
        } catch (error: any) {
             if (error.code === 'permission-denied') setPermissionError(true);
             else {
                console.error("Error saving settings:", error);
                alert("Failed to save settings.");
             }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading settings...</div>;
    if (permissionError) return <PermissionGuide firebaseConfig={(firebase.app() as any).options} />;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Website Settings</h1>
                    <p className="text-slate-500">Your current plan is: <strong className="text-slate-800">{userPlan}</strong></p>
                </div>
                <div className="flex items-center gap-3">
                    <a href={`/#/${subdomain}`} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
                        <EyeIcon className="h-5 w-5" />
                        <span>Preview</span>
                    </a>
                    <button onClick={handleSave} disabled={isSaving} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Branding - Golden Only */}
                {userPlan === PlanTier.Golden && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Branding &amp; Theme <PlanBadge plan={PlanTier.Golden} /></h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5">Theme Color</label>
                                    <input type="color" name="themeColor" value={settings.themeColor} onChange={handleInputChange} className="w-24 h-10 p-1 border border-slate-300 rounded-lg" />
                                 </div>
                                 <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5">Button Color</label>
                                    <input type="color" name="buttonColor" value={settings.buttonColor} onChange={handleInputChange} className="w-24 h-10 p-1 border border-slate-300 rounded-lg" />
                                 </div>
                                 <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5">Text Color</label>
                                    <input type="color" name="textColor" value={settings.textColor} onChange={handleInputChange} className="w-24 h-10 p-1 border border-slate-300 rounded-lg" />
                                 </div>
                                  <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5">Footer Color</label>
                                    <input type="color" name="footerColor" value={settings.footerColor} onChange={handleInputChange} className="w-24 h-10 p-1 border border-slate-300 rounded-lg" />
                                  </div>
                             </div>
                            <div>
                                 <label className="font-semibold text-slate-700 block mb-1.5">Hospital Logo</label>
                                 {logoPreview && <img src={logoPreview} alt="Logo preview" className="h-12 mb-2 bg-slate-100 p-1 rounded" />}
                                 <input type="file" onChange={(e) => handleImageChange(e, 'logo')} accept="image/png, image/jpeg" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"/>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Homepage Content */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Homepage Content</h2>
                    <div className="space-y-6">
                        {(userPlan === PlanTier.Premium || userPlan === PlanTier.Golden) && (
                            <div>
                                 <label className="font-semibold text-slate-700 block mb-1.5">Landing Page Image <PlanBadge plan={PlanTier.Premium} /></label>
                                 {heroImagePreview && <img src={heroImagePreview} alt="Hero preview" className="h-32 w-full object-cover rounded-lg mb-2 bg-slate-100" />}
                                 <input type="file" onChange={(e) => handleImageChange(e, 'hero')} accept="image/png, image/jpeg" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"/>
                            </div>
                        )}
                        <div>
                             <label htmlFor="aboutUs" className="font-semibold text-slate-700 block mb-1.5">About Us Section</label>
                             <textarea id="aboutUs" name="aboutUs" value={settings.aboutUs} onChange={handleInputChange} rows={5} placeholder="Write a brief introduction to your hospital..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                 <div className="bg-white p-6 rounded-xl shadow-md">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Contact Information</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="contactPhone" className="font-semibold text-slate-700 block mb-1.5">Phone Number</label>
                            <input type="tel" id="contactPhone" name="contactPhone" value={settings.contactPhone} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"/>
                          </div>
                          <div>
                            <label htmlFor="contactEmail" className="font-semibold text-slate-700 block mb-1.5">Email Address</label>
                            <input type="email" id="contactEmail" name="contactEmail" value={settings.contactEmail} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"/>
                          </div>
                          <div className="md:col-span-2">
                             <label htmlFor="address" className="font-semibold text-slate-700 block mb-1.5">Full Address</label>
                             <input type="text" id="address" name="address" value={settings.address} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"/>
                          </div>
                     </div>
                      {userPlan === PlanTier.Golden && (
                          <div className="mt-6 pt-4 border-t border-slate-200">
                              <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-bold text-slate-800">Social Media Links <PlanBadge plan={PlanTier.Golden} /></h3>
                                  <button onClick={() => addListItem('socialLinks')} className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-700"><PlusIcon className="h-4 w-4"/> Add Link</button>
                              </div>
                              <div className="space-y-4">
                                {settings.socialLinks?.map((link, index) => (
                                  <div key={link.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-lg">
                                    <select value={link.platform} onChange={e => handleListChange<SocialLink>('socialLinks', index, 'platform', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                        <option>Facebook</option>
                                        <option>Twitter</option>
                                        <option>Instagram</option>
                                        <option>LinkedIn</option>
                                    </select>
                                    <input type="url" value={link.url} onChange={e => handleListChange<SocialLink>('socialLinks', index, 'url', e.target.value)} placeholder="Full URL (e.g., https://...)" className="w-full md:col-span-2 px-3 py-2 border border-slate-300 rounded-md"/>
                                    <button onClick={() => removeListItem('socialLinks', index)} className="text-red-500 hover:text-red-700 justify-self-start md:col-start-4"><TrashIcon className="h-5 w-5"/></button>
                                  </div>
                                ))}
                              </div>
                          </div>
                      )}
                </div>

                {/* Advanced Content - Golden Only */}
                {userPlan === PlanTier.Golden && (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800">Services / Departments <PlanBadge plan={PlanTier.Golden} /></h2>
                                <button onClick={() => addListItem('services')} className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-700"><PlusIcon className="h-4 w-4"/> Add Service</button>
                            </div>
                             <div className="space-y-4">
                                {settings.services?.map((service, index) => (
                                    <div key={service.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-lg">
                                        <input type="text" value={service.name} onChange={e => handleListChange<ServiceItem>('services', index, 'name', e.target.value)} placeholder="Service Name (e.g., Cardiology)" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                                        <input type="text" value={service.description} onChange={e => handleListChange<ServiceItem>('services', index, 'description', e.target.value)} placeholder="Short Description" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                                        <button onClick={() => removeListItem('services', index)} className="text-red-500 hover:text-red-700 justify-self-start md:justify-self-end"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                         <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800">Patient Testimonials <PlanBadge plan={PlanTier.Golden} /></h2>
                                <button onClick={() => addListItem('testimonials')} className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-700"><PlusIcon className="h-4 w-4"/> Add Testimonial</button>
                            </div>
                             <div className="space-y-4">
                                {settings.testimonials?.map((testimonial, index) => (
                                    <div key={testimonial.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-lg">
                                         <input type="text" value={testimonial.patientName} onChange={e => handleListChange<Testimonial>('testimonials', index, 'patientName', e.target.value)} placeholder="Patient Name" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                                         <textarea value={testimonial.quote} onChange={e => handleListChange<Testimonial>('testimonials', index, 'quote', e.target.value)} placeholder="Testimonial Quote" rows={2} className="md:col-span-2 w-full px-3 py-2 border border-slate-300 rounded-md"/>
                                         <button onClick={() => removeListItem('testimonials', index)} className="text-red-500 hover:text-red-700 justify-self-start md:justify-self-end md:col-start-4"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WebsiteSettings;
