"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, ChevronLeft, Check, AlertTriangle, ShieldCheck, XCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { uploadImage } from "@/lib/storage-service";
import {
  updateAdminGallery,
  type GalleryProfilePicture,
} from "@/lib/gallery-service";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

function isPersistableGalleryId(id?: string): boolean {
  return Boolean(id && OBJECT_ID_RE.test(id));
}

interface GalleryWizardProps {
  galleryId?: string; // If present, it's detail/edit mode
  initialData?: any;
}

const STEPS = [
  { number: 1, title: "Create Record" },
  { number: 2, title: "Public Profile Seed" },
  { number: 3, title: "Org & Payouts" },
  { number: 4, title: "Documents Upload" },
  { number: 5, title: "Compliance Review" },
  { number: 6, title: "Agreement Capture" },
  { number: 7, title: "Activation" },
  { number: 8, title: "Ongoing Operations" },
];

export function GalleryOnboardingWizard({ galleryId, initialData }: GalleryWizardProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    legalName: initialData?.legalName || "",
    dbaName: initialData?.dbaName || "",
    internalRef: initialData?.internalRef || galleryId || "GAL-MOCK-77",
    contactName: initialData?.contactName || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    displayName: initialData?.displayName || "",
    shortDesc: initialData?.shortDesc || "",
    longDesc: initialData?.longDesc || "",
    profilePicture: (initialData?.profilePicture as GalleryProfilePicture | null) ?? null,
    address: initialData?.address || "",
    taxId: initialData?.taxId || "",
    walletAddress: initialData?.walletAddress || "",
    docType: "Entity Proof",
    docExpiry: "",
    docVersion: "v1.0",
    complianceCheck1: initialData?.complianceCheck1 || false,
    complianceCheck2: initialData?.complianceCheck2 || false,
    complianceCheck3: initialData?.complianceCheck3 || false,
    approver: initialData?.approver || "Adaeze Nwosu",
    complianceComments: initialData?.complianceComments || "",
    agreementRef: initialData?.agreementRef || "",
    agreementDate: initialData?.agreementDate || "",
    agreementVersion: initialData?.agreementVersion || "v1.0",
    isActive: initialData?.isActive || false,
  });

  const [uploadedDocs, setUploadedDocs] = useState<any[]>([
    { type: "Entity Proof", expiry: "2028-12-31", version: "v1.0", file: "cert_of_incorporation.pdf" },
    { type: "Tax Form", expiry: "2027-04-15", version: "v2.0", file: "w9_form.pdf" },
  ]);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(initialData?.profilePreviewUrl || "");
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = {
      type: formData.docType,
      expiry: formData.docExpiry || "N/A",
      version: formData.docVersion,
      file: `${formData.docType.toLowerCase().replace(/ /g, "_")}_doc.pdf`,
    };
    setUploadedDocs((prev) => [...prev, newDoc]);
    setFormData((prev) => ({ ...prev, docExpiry: "", docVersion: "v1.0" }));
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setProfileError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setProfileError("Image is too large. Please select an image smaller than 10MB.");
      return;
    }

    setProfileUploading(true);
    setProfileError("");

    const uploadResult = await uploadImage(file);
    if (!uploadResult.ok) {
      setProfileError(uploadResult.message || "Failed to upload profile picture.");
      setProfileUploading(false);
      return;
    }

    const profilePicture: GalleryProfilePicture = {
      s3Bucket: uploadResult.data.bucket,
      s3Key: uploadResult.data.key,
      mimeType: uploadResult.data.mimeType,
      originalName: uploadResult.data.originalName,
      size: uploadResult.data.size,
    };

    if (isPersistableGalleryId(galleryId)) {
      const updateResult = await updateAdminGallery(galleryId!, { profilePicture });
      if (!updateResult.ok) {
        setProfileError(updateResult.message || "Failed to save gallery profile picture.");
        setProfileUploading(false);
        return;
      }
    }

    setFormData((prev) => ({ ...prev, profilePicture }));
    setProfilePreviewUrl(uploadResult.data.downloadUrl);
    setProfileUploading(false);
  };

  const handleProfilePictureRemove = async () => {
    setProfileUploading(true);
    setProfileError("");

    if (isPersistableGalleryId(galleryId)) {
      const updateResult = await updateAdminGallery(galleryId!, { profilePicture: null });
      if (!updateResult.ok) {
        setProfileError(updateResult.message || "Failed to remove gallery profile picture.");
        setProfileUploading(false);
        return;
      }
    }

    setFormData((prev) => ({ ...prev, profilePicture: null }));
    setProfilePreviewUrl("");
    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
    setProfileUploading(false);
  };

  const nextStep = () => {
    if (activeStep < 8) setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep((prev) => prev - 1);
  };

  const handleSave = () => {
    alert("Gallery state saved successfully!");
    router.push("/galleries");
  };

  const handleActivate = () => {
    setFormData((prev) => ({ ...prev, isActive: true }));
    alert("Gallery onboarded and successfully activated!");
    setActiveStep(8); // Move to ongoing operations
  };

  const handleSuspend = () => {
    if (confirm("Are you sure you want to suspend this gallery? This will deactivate public listings.")) {
      setFormData((prev) => ({ ...prev, isActive: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* LEFT: STEPPER RAIL */}
      <div className="lg:col-span-1 flex flex-col space-y-2">
        {STEPS.map((step) => {
          const isCompleted = activeStep > step.number;
          const isActive = activeStep === step.number;
          const isUpcoming = activeStep < step.number;

          let squareBg = "bg-transparent border-2 border-black/20 text-[#11181c]/50";
          if (isCompleted) {
            squareBg = "bg-[#1A3F6C] border-2 border-[#1A3F6C] text-[#f5f0ec]";
          } else if (isActive) {
            squareBg = "bg-transparent border-2 border-[#1A3F6C] text-[#1A3F6C] font-extrabold";
          }

          return (
            <button
              key={step.number}
              onClick={() => setActiveStep(step.number)}
              className="flex items-center text-left gap-4 p-3 hover:bg-black/5 transition-all text-xs border-radius-0"
            >
              {/* Sharp square indicator */}
              <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs shrink-0 select-none ${squareBg}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>

              {/* Step text */}
              <div className="leading-tight">
                <span className="block text-[9px] font-bold text-[#1A3F6C]/60 uppercase tracking-widest leading-none">
                  Step 0{step.number}
                </span>
                <span className={`block font-black text-sm uppercase tracking-wider ${isActive ? "text-[#1A3F6C]" : "text-[#11181c]/70"}`}>
                  {step.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* RIGHT: ACTIVE STEP FORM CONTAINER */}
      <div className="lg:col-span-3 card-neumorph p-6 flex flex-col justify-between min-h-[500px]">
        {/* Step Header */}
        <div className="border-b border-black/5 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-[#1A3F6C]">
              {STEPS[activeStep - 1].title}
            </h3>
            <p className="text-xs text-[#11181c]/60 font-bold uppercase tracking-wider">
              Step {activeStep} of 8
            </p>
          </div>
          {galleryId && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A3F6C]/60">STATUS:</span>
              <StatusBadge status={formData.isActive ? "ACTIVE" : "PENDING"} variant="gallery" />
            </div>
          )}
        </div>

        {/* STEP CONTENT */}
        <div className="flex-1">
          {/* STEP 1: CREATE RECORD */}
          {activeStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="field-label">Legal Entity Name</label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  placeholder="e.g. Meridian Art Group LLC"
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
              <div>
                <label className="field-label">Doing Business As (DBA)</label>
                <input
                  type="text"
                  name="dbaName"
                  value={formData.dbaName}
                  onChange={handleInputChange}
                  placeholder="e.g. Meridian Contemporary"
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
              <div>
                <label className="field-label">Internal Reference ID</label>
                <input
                  type="text"
                  name="internalRef"
                  value={formData.internalRef}
                  onChange={handleInputChange}
                  placeholder="GAL-001"
                  className="input-neumorph w-full text-sm font-bold bg-black/5 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="field-label">Primary Representative</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="e.g. Maya Okonkwo"
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
              <div>
                <label className="field-label">Representative Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="e.g. maya@meridianart.com"
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
              <div>
                <label className="field-label">Representative Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1-555-019-2834"
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PUBLIC PROFILE SEED */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="field-label">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="e.g. Meridian Contemporary"
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="field-label mb-0">Short Pitch/Description</label>
                  <span className="text-[10px] font-bold text-[#1A3F6C]/60">
                    {formData.shortDesc.length}/160 Chars
                  </span>
                </div>
                <input
                  type="text"
                  name="shortDesc"
                  maxLength={160}
                  value={formData.shortDesc}
                  onChange={handleInputChange}
                  placeholder="A highly curated focus on emerging West African contemporary artists..."
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
              <div>
                <label className="field-label">Long Profile Description</label>
                <textarea
                  name="longDesc"
                  rows={4}
                  value={formData.longDesc}
                  onChange={handleInputChange}
                  placeholder="Describe your history, curatorial thesis, and vision in detail..."
                  className="input-neumorph w-full text-sm font-medium"
                />
              </div>
              <div>
                <label className="field-label">Gallery Profile Picture</label>
                <div className="card-neumorph p-4 border border-dashed border-[#1A3F6C]/20 flex flex-col items-center justify-center gap-3">
                  {profilePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePreviewUrl}
                      alt="Gallery profile preview"
                      className="h-24 w-24 rounded-full object-cover border border-[#1A3F6C]/10"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-[#1A3F6C]" />
                  )}
                  <div className="text-center">
                    <span className="text-xs font-bold block text-[#11181c]">
                      {profilePreviewUrl
                        ? "Gallery profile picture uploaded"
                        : "Upload the gallery profile picture"}
                    </span>
                    <span className="text-[10px] font-bold block text-[#1A3F6C]/60 mt-1">
                      PNG or JPG up to 10MB (recommended square image)
                    </span>
                  </div>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleProfilePictureUpload(file);
                      event.target.value = "";
                    }}
                  />
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      className="btn-neumorph text-xs font-bold py-1.5 px-4 disabled:opacity-50"
                      disabled={profileUploading}
                      onClick={() => profileInputRef.current?.click()}
                    >
                      {profileUploading ? "Uploading…" : profilePreviewUrl ? "Replace image" : "Browse files"}
                    </button>
                    {profilePreviewUrl && (
                      <button
                        type="button"
                        className="text-xs font-bold py-1.5 px-4 border border-red-200 text-red-600 disabled:opacity-50"
                        disabled={profileUploading}
                        onClick={() => void handleProfilePictureRemove()}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {profileError && (
                    <p className="text-xs text-red-500 text-center">{profileError}</p>
                  )}
                  {!isPersistableGalleryId(galleryId) && (
                    <p className="text-[10px] text-[#616161] text-center">
                      Save the gallery record first to persist the profile picture to the backend.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ORG & PAYOUTS */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="field-label">Physical Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 14 Kingsway Road, Ikoyi, Lagos, Nigeria"
                  className="input-neumorph w-full text-sm font-bold"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="field-label">Registered Tax ID / VAT</label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="e.g. RC-9284104-Z"
                    className="input-neumorph w-full text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="field-label">Payout Stellar Wallet Address</label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                    placeholder="e.g. GCKFBEIYTKP3BPNM5Y72..."
                    className="input-neumorph w-full text-xs font-mono font-bold"
                  />
                  <span className="text-[9px] font-bold text-[#1A3F6C]/60 block mt-1 uppercase">
                    Stellar key format (G...). Public key used for direct royalty splits.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENTS UPLOAD */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <form onSubmit={handleAddDocument} className="card-neumorph p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="field-label">Document Category</label>
                  <select
                    name="docType"
                    value={formData.docType}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                  >
                    <option value="Entity Proof">Entity Proof</option>
                    <option value="ID">Identity (Owner ID)</option>
                    <option value="Tax Form">Tax Form</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Brand Asset">Brand Asset</option>
                    <option value="Insurance">Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Expiry Date</label>
                  <input
                    type="date"
                    name="docExpiry"
                    value={formData.docExpiry}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="field-label">Version</label>
                  <input
                    type="text"
                    name="docVersion"
                    value={formData.docVersion}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-bold"
                  />
                </div>
                <button type="submit" className="btn-neumorph text-xs font-bold py-2.5 px-4 w-full">
                  Queue Document
                </button>
              </form>

              {/* Uploaded Documents List */}
              <div className="space-y-2">
                <span className="field-label">Uploaded Credentials</span>
                <div className="card-neumorph overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-black/10">
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70">Type</th>
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70">File</th>
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70">Expiry</th>
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70">Version</th>
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedDocs.map((doc, idx) => (
                        <tr key={idx} className="border-b border-black/5 last:border-0">
                          <td className="px-4 py-2.5 font-bold uppercase tracking-wider text-[#1A3F6C]">{doc.type}</td>
                          <td className="px-4 py-2.5 font-mono">{doc.file}</td>
                          <td className="px-4 py-2.5 font-bold">{doc.expiry}</td>
                          <td className="px-4 py-2.5 font-bold text-gray-500">{doc.version}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-green-700">SUBMITTED</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLIANCE REVIEW */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div className="card-neumorph p-4 space-y-4">
                <span className="field-label">Compliance Checklist</span>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-[#11181c]">
                    <input
                      type="checkbox"
                      checked={formData.complianceCheck1}
                      onChange={(e) => handleCheckboxChange("complianceCheck1", e.target.checked)}
                      className="w-4 h-4 rounded-none accent-[#1A3F6C]"
                    />
                    <span>Verified Legal Entity Registration Matches Uploads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-[#11181c]">
                    <input
                      type="checkbox"
                      checked={formData.complianceCheck2}
                      onChange={(e) => handleCheckboxChange("complianceCheck2", e.target.checked)}
                      className="w-4 h-4 rounded-none accent-[#1A3F6C]"
                    />
                    <span>KYC & Owner Identity Verification Complete</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-[#11181c]">
                    <input
                      type="checkbox"
                      checked={formData.complianceCheck3}
                      onChange={(e) => handleCheckboxChange("complianceCheck3", e.target.checked)}
                      className="w-4 h-4 rounded-none accent-[#1A3F6C]"
                    />
                    <span>Stellar Payout Wallet Signed Commitment Receipt</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="field-label">Reviewing Approver</label>
                  <select
                    name="approver"
                    value={formData.approver}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                  >
                    <option value="Adaeze Nwosu">Adaeze Nwosu (Super Admin)</option>
                    <option value="Tobias Kraft">Tobias Kraft (Admin)</option>
                    <option value="Yemi Adeyemi">Yemi Adeyemi (Moderator)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Internal Audit Notes</label>
                  <textarea
                    name="complianceComments"
                    value={formData.complianceComments}
                    onChange={handleInputChange}
                    placeholder="Enter compliance evaluation notes here..."
                    className="input-neumorph w-full text-xs font-bold"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: AGREEMENT CAPTURE */}
          {activeStep === 6 && (
            <div className="space-y-6">
              <div className="card-neumorph p-4 border border-dashed border-[#1A3F6C]/20 flex flex-col items-center justify-center gap-3">
                <Upload className="w-8 h-8 text-[#1A3F6C]" />
                <div className="text-center">
                  <span className="text-xs font-bold block text-[#11181c]">Upload Signed PDF Agreement</span>
                  <span className="text-[10px] font-bold block text-[#1A3F6C]/60 mt-1">E-signed contract copy (PDF under 15MB)</span>
                </div>
                <button className="btn-neumorph text-xs font-bold py-1.5 px-4 mt-2">
                  Select Agreement File
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="field-label">E-Signature Reference</label>
                  <input
                    type="text"
                    name="agreementRef"
                    value={formData.agreementRef}
                    onChange={handleInputChange}
                    placeholder="e.g. DOCUSIGN-AB92-8172"
                    className="input-neumorph w-full text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="field-label">Effective Date</label>
                  <input
                    type="date"
                    name="agreementDate"
                    value={formData.agreementDate}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="field-label">Agreement Version</label>
                  <input
                    type="text"
                    name="agreementVersion"
                    value={formData.agreementVersion}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: ACTIVATION */}
          {activeStep === 7 && (
            <div className="space-y-6">
              <div className="card-neumorph p-5 space-y-4">
                <div className="flex items-center gap-2 text-[#1A3F6C]">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">
                    Pre-Activation Onboarding Audit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-[#11181c]/70">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#1A3F6C]"></span>
                    <span>Legal Record: Configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#1A3F6C]"></span>
                    <span>Public Profile: Seeded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#1A3F6C]"></span>
                    <span>Payout address: GCKF...RK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#1A3F6C]"></span>
                    <span>Documents: 2 uploaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#1A3F6C]"></span>
                    <span>Compliance review: Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#1A3F6C]"></span>
                    <span>Signed Agreement: Embedded</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Activating this gallery grants them full access to list digital artworks, host drop pages, and route proceeds directly via custom split agreements on the Stellar blockchain.
                </p>
              </div>

              <button
                onClick={handleActivate}
                className="btn-neumorph w-full p-4 font-black uppercase tracking-widest text-[#f5f0ec] bg-[#1A3F6C] hover:bg-[#1A3F6C]/90 hover:shadow-lg text-sm block text-center"
              >
                Activate Gallery
              </button>
            </div>
          )}

          {/* STEP 8: ONGOING OPERATIONS */}
          {activeStep === 8 && (
            <div className="space-y-6">
              {/* Document Expiry Alerts Table */}
              <div className="space-y-2">
                <span className="field-label flex items-center gap-1.5 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  Credentials Expiry Schedule
                </span>
                <div className="card-neumorph overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-black/10">
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70">Document</th>
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70">Expiry Date</th>
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70">Alert Timeline</th>
                        <th className="px-4 py-2 font-bold uppercase text-[#1A3F6C]/70 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black/5 bg-amber-50/50">
                        <td className="px-4 py-2.5 font-bold uppercase text-[#11181c]">Tax Form (w9)</td>
                        <td className="px-4 py-2.5 font-bold text-amber-700">2027-04-15</td>
                        <td className="px-4 py-2.5 font-bold text-amber-800">EXPIRING IN 11 MONTHS</td>
                        <td className="px-4 py-2.5 text-right">
                          <button className="text-xs font-bold text-[#1A3F6C] underline">Notify</button>
                        </td>
                      </tr>
                      <tr className="border-b border-black/5">
                        <td className="px-4 py-2.5 font-bold uppercase text-[#11181c]">Entity Incorporation</td>
                        <td className="px-4 py-2.5 font-bold text-[#11181c]">2028-12-31</td>
                        <td className="px-4 py-2.5 text-slate-500 font-bold">STABLE (2+ YEARS)</td>
                        <td className="px-4 py-2.5 text-right">
                          <button className="text-xs font-bold text-[#1A3F6C] underline">View</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Administrative / Compliance Control Panel */}
              <div className="card-neumorph p-5 space-y-4">
                <span className="field-label">Regulatory & Control Operations</span>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      alert("Reverification request dispatched to representative.");
                    }}
                    className="btn-neumorph text-xs font-extrabold py-2 px-4 uppercase tracking-wider"
                  >
                    Force Reverification
                  </button>

                  <button
                    onClick={handleSuspend}
                    className="btn-neumorph text-xs font-extrabold py-2 px-4 uppercase tracking-wider text-red-700 border border-red-200 hover:bg-red-50"
                  >
                    Suspend Partner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEPPER NAV CONTROLS */}
        <div className="border-t border-black/5 pt-4 mt-8 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={activeStep === 1}
            className="btn-neumorph py-2 px-4 text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {activeStep < 8 ? (
            <button
              onClick={nextStep}
              className="btn-neumorph py-2 px-4 text-xs font-bold flex items-center gap-1"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn-neumorph py-2 px-6 text-xs font-black uppercase tracking-widest text-[#f5f0ec] bg-[#1A3F6C]"
            >
              Finish & Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
