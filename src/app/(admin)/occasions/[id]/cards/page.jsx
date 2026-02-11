"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import CardDesigns from "@/components/occasions/CardDesigns";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { getOccasionById } from "../../../../../lib/action/occasionAction";

const OccasionCardsPage = ({ params }) => {
  const { id } = use(params); // ✅ unwrap params

  const router = useRouter();
  const [occasion, setOccasion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchOccasion = async () => {
      try {
        setLoading(true);
        const result = await getOccasionById(id);

        if (result.success) {
          setOccasion(result.data);
        } else {
          toast.error(result.message || "Failed to load occasion details");
        }
      } catch (error) {
        console.error("Error fetching occasion:", error);
        toast.error("Error loading occasion details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOccasion();
  }, [id]);

  const handleCardCountChange = async () => {
    try {
      const result = await getOccasionById(id);
      if (result.success) {
        setOccasion(result.data);
      }
    } catch (error) {
      console.error("Error refetching occasion:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={20} />
          Loading occasion details...
        </div>
      </div>
    );
  }

  if (!occasion) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Occasion not found.</p>
        <Link href="/occasions" className="text-blue-600 hover:underline">
          Back to Occasions
        </Link>
      </div>
    );
  }

  return (
    <CardDesigns
      occasion={occasion}
      onBack={() => router.push("/occasions")}
      onCardCountChange={handleCardCountChange}
      modalOpen={modalOpen}
      setModalOpen={setModalOpen}
    />
  );
};

export default OccasionCardsPage;
