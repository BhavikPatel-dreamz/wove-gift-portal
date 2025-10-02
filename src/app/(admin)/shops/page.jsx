"use client"
import React, { useState, useEffect } from 'react';
import { getShops } from '@/lib/action/data';
import DynamicTable from '@/components/forms/DynamicTable';
import { Loader } from 'lucide-react';

const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const shopsData = await getShops();
        setShops(shopsData);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Shop Name',
    },
    {
      accessorKey: 'shop',
      header: 'Domain',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'currency',
      header: 'Currency',
    },
    {
      accessorKey: 'countryName',
      header: 'Country',
    },
    {
      accessorKey: 'planName',
      header: 'Plan',
    },
    {
        accessorKey: 'createdAt',
        header: 'Installed At',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={20} />
          Loading shops...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        <DynamicTable
          data={shops}
          columns={columns}
          title="Installed Shops"
          subtitle="A list of all shops that have installed the app."
          searchPlaceholder="Search by shop name or domain..."
          enableStatusFilter={false}
        />
      </div>
    </div>
  );
};

export default ShopsPage;
