"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ComplaintReportForm() {
  const [formData, setFormData] = useState<{
    image: File | null;
    title: string;
    description: string;
    location: string;
    category: string;
  }>({
    image: null,
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    const { name } = target

    if (target instanceof HTMLInputElement && target.type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: target.files?.[0] ?? null,
      }))
      return
    }

    const { value } = target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.category
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    // Create FormData
    const data = new FormData();
    if (formData.image) {
      data.append("image", formData.image);
    }
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("category", formData.category);

    try {
      // POST to backend
      const response = await fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit complaint");
      }

      // Success feedback
      alert("Complaint submitted successfully!");

      //Reset form
      setFormData({
        image: null,
        title: "",
        description: "",
        location: "",
        category: "",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl rounded-3xl border border-[#E1F1E4] shadow-[0_30px_70px_rgba(0,0,0,0.08)] bg-white">
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#007ACC]">
              Civic Complaint Submission
            </p>
            <h2 className="text-3xl font-semibold text-[#2C6E49]">
              Report an Issue
            </h2>
            <p className="text-sm text-[#4D4D4D]">
              Help local authorities respond faster by sharing accurate details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[#2C6E49] font-medium">Upload Image</Label>
              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="rounded-2xl border border-[#E1F1E4] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#A1D99B]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2C6E49] font-medium">Title</Label>
              <Input
                type="text"
                name="title"
                placeholder="Short complaint title"
                value={formData.title}
                onChange={handleChange}
                required
                className="rounded-2xl border border-[#E1F1E4] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#A1D99B]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2C6E49] font-medium">Description</Label>
              <Textarea
                name="description"
                placeholder="Describe the issue in detail"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="rounded-2xl border border-[#E1F1E4] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#A1D99B]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2C6E49] font-medium">Location</Label>
              <Input
                type="text"
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleChange}
                required
                className="rounded-2xl border border-[#E1F1E4] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#A1D99B]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2C6E49] font-medium">Category</Label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E1F1E4] bg-white px-4 py-2 text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#A1D99B]"
                required
              >
                <option value="">Select category</option>
                <option value="Road">Road</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
                <option value="Garbage">Garbage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#2C6E49] text-white text-base font-semibold py-3 hover:bg-[#24573A] transition disabled:opacity-80"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
