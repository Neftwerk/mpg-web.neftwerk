"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileMenu } from "@/components/sidebar/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CollectionsPage() {
  return (
    <AuthGuard>
      <CollectionsContent />
    </AuthGuard>
  );
}

function CollectionsContent() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Collections"
        backHref="/gallery"
        backLabel="Back to My Gallery"
        onMenuOpen={() => setMenuOpen(true)}
      />

      <div className="p-4 pb-28 mt-20 lg:mt-0 lg:pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* #Favorite Pieces */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">
              #Favorite Pieces
            </p>
            <div className="card-neumorph">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  src="/images/fav1.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav3.png"
                  alt=""
                  className="w-full row-span-2 h-full object-cover"
                />
                <img
                  src="/images/fav2.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* #Ones to watch */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">
              #Ones to watch
            </p>
            <div className="card-neumorph">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img
                  src="/images/fav4.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav5.png"
                  alt=""
                  className="w-full row-span-2 h-full object-cover"
                />
                <img
                  src="/images/fav6.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* #German artists */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">
              #German artists
            </p>
            <div className="card-neumorph">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img
                  src="/images/fav7.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav8.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav9.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav10.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* #Female artists */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">
              #Female artists
            </p>
            <div className="card-neumorph">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img
                  src="/images/fav11.png"
                  alt=""
                  className="w-full row-span-2 h-full object-cover"
                />
                <img
                  src="/images/fav12.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav13.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* #Inspiration */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">
              #Inspiration
            </p>
            <div className="card-neumorph">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img
                  src="/images/fav1.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav7.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav9.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav4.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* eslint-enable @next/next/no-img-element */}
              </div>
            </div>
          </div>

          {/* #Nostalgic */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">
              #Nostalgic
            </p>
            <div className="card-neumorph">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  src="/images/fav2.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav5.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav8.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <img
                  src="/images/fav10.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* eslint-enable @next/next/no-img-element */}
              </div>
            </div>
          </div>
        </div>

        {/* Create collection button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/new-collection"
            className="btn-neumorph px-8"
          >
            Create a new collection
          </Link>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
