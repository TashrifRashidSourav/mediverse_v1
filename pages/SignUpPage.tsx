import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { type Plan, type SignUpFormData, PlanTier, type User } from "../types";
import { PLANS } from "../constants";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { auth, db } from "../firebase";
import PaymentPopup from "../components/PaymentPopup"; // Import the new payment popup

const SignUpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState<SignUpFormData>({
    hospitalName: "",
    location: "",
    registrationNumber: "",
    phone: "",
    email: "",
    subdomain: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  useEffect(() => {
    const planTier = searchParams.get("plan") as PlanTier;
    if (planTier && Object.values(PlanTier).includes(planTier)) {
      const selectedPlan = PLANS.find((p) => p.tier === planTier);
      if (selectedPlan) {
        setPlan(selectedPlan);
      } else {
        navigate("/#pricing");
      }
    } else {
      navigate("/#pricing");
    }
  }, [searchParams, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "hospitalName") {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormData((prev) => ({ ...prev, subdomain }));
    }
  };

  // This function is called when the user clicks the "Proceed to Pay" button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.hospitalName ||
      !formData.email ||
      !formData.password ||
      !formData.subdomain
    ) {
      setError("Please fill out all required fields.");
      return;
    }
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Step 1: Ensure subdomain is unique BEFORE showing payment popup
      const existing = await db
        .collection("users")
        .where("subdomain", "==", formData.subdomain)
        .get();

      if (!existing.empty) {
        throw new Error(
          "This website URL (subdomain) is already taken. Please choose another."
        );
      }
      
      // Step 2: Open the payment popup instead of redirecting
      setIsPaymentPopupOpen(true);

    } catch (err: any)
    {
      console.error("[Signup Prerequisite Error]", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // This function is called by the popup after the fake payment is "successful"
  const handlePaymentSuccess = async () => {
    setIsSubmitting(true); // Show loading indicator on the main page as well
    setError('');

    if (!plan) {
        setError("Plan information is missing.");
        setIsSubmitting(false);
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(
            formData.email,
            formData.password
        );
        const createdUser = userCredential.user;
        if (!createdUser) throw new Error("User creation failed.");

        const newUserProfile: User = {
            uid: createdUser.uid,
            email: formData.email,
            hospitalName: formData.hospitalName,
            subdomain: formData.subdomain,
            plan: plan.tier,
            status: 'pending',
            location: formData.location, // Save location for public list
        };
        await db.collection("users").doc(createdUser.uid).set(newUserProfile);
        await auth.signOut(); // Ensure user is not auto-logged in
        
        // Redirect to login page after successful creation
        navigate('/login');

    } catch (err: any) {
        console.error("[Account Creation Error]", err);
        if (err.code === 'auth/email-already-in-use') {
             setError("This email is already registered. If this was a mistake, please contact support.");
        } else {
            setError("Failed to create your account. Please contact support.");
        }
    } finally {
        setIsSubmitting(false);
        setIsPaymentPopupOpen(false);
    }
  };


  if (!plan)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p>Loading...</p>
      </div>
    );

  return (
    <>
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 md:py-20 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          <div className="p-8 md:p-12">
            
                <h2 className="text-3xl font-bold text-slate-900">
                  Create Your Hospital Account
                </h2>
                <p className="text-slate-500 mt-2">
                  You've selected the{" "}
                  <span className="font-bold text-primary">{plan.tier}</span>{" "}
                  plan. Let's get you set up.
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="hospitalName"
                        className="font-semibold text-slate-700 block mb-1.5"
                      >
                        Hospital Name*
                      </label>
                      <input
                        type="text"
                        id="hospitalName"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subdomain"
                        className="font-semibold text-slate-700 block mb-1.5"
                      >
                        Your Website URL*
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          id="subdomain"
                          name="subdomain"
                          value={formData.subdomain}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                          required
                        />
                        <span className="px-4 py-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-500">
                          .mediverse.app
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="font-semibold text-slate-700 block mb-1.5"
                    >
                      Admin Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="password"
                        className="font-semibold text-slate-700 block mb-1.5"
                      >
                        Password*
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="font-semibold text-slate-700 block mb-1.5"
                      >
                        Confirm Password*
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                        required
                      />
                    </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="location" className="font-semibold text-slate-700 block mb-1.5">Location (City, Country)</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5">Phone Number</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" />
                      </div>
                  </div>


                  {error && (
                    <p className="text-red-600 text-sm mt-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center mt-6"
                  >
                    {isSubmitting
                      ? "Validating..."
                      : `Proceed to Pay BDT ${plan.price}`}
                  </button>
                </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    <PaymentPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        plan={plan}
        onPaymentSuccess={handlePaymentSuccess}
    />
    </>
  );
};

export default SignUpPage;