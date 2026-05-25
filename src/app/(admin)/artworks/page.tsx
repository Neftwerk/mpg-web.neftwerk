"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ArtworkCard, ArtworkData } from "@/components/admin/ArtworkCard";
import { PlusCircle, Search, Grid, Table, X, Upload, Coins, Percent, Landmark } from "lucide-react";

const INITIAL_ARTWORKS: ArtworkData[] = [
  {
    id: "art-1",
    title: "Chromatic Dissolution No. 4",
    artist: "Maya Okonkwo",
    collection: "Inaugural Drop — Meridian Contemporary",
    status: "MINTED",
    listPrice: 450,
    royaltyBps: 750, // 7.5%
    payoutAddress: "GCKFBEIYTKP3BPNM5Y72YOILXDGJ6ZV2IUCWQXQ7J3WYVZPQJM4Y3RK",
    metadataCid: "bafybeigdyrzt5s2tlfee3dlw4a3e23za77a",
    description: "An intricate study of digital particles reacting to color gradient forces. The work explores the transition from raw digital artifacts into organic pixel formations on the Stellar network.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80",
  },
  {
    id: "art-2",
    title: "Still Life with Protocol",
    artist: "Emre Demir",
    collection: "Bodies in Transit",
    status: "LISTED",
    listPrice: 620,
    royaltyBps: 1000, // 10%
    payoutAddress: "GDKLP5NZYMF3VCFKJFVH2H3RJVMCXBKHQMFJTQAHLZ6DTQZVBWQO5VY",
    description: "A digital reimagining of classical still life compositions, incorporating blockchain verification hashes directly as typographical aesthetic objects inside the painting canvas.",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80",
  },
  {
    id: "art-3",
    title: "Sovereign Blue",
    artist: "Lena Hartmann",
    collection: "Inaugural Drop — Meridian Contemporary",
    status: "READY",
    listPrice: 380,
    royaltyBps: 500, // 5%
    payoutAddress: "GCKFBEIYTKP3BPNM5Y72YOILXDGJ6ZV2IUCWQXQ7J3WYVZPQJM4Y3RK",
    description: "A minimalist texture-focused study, capturing shades of deep ultramarine representing physical sovereignty in digital ledgers. The piece was processed using zero-knowledge commitment splits.",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80",
  },
  {
    id: "art-4",
    title: "Erosion Study III",
    artist: "Maya Okonkwo",
    collection: "Inaugural Drop — Meridian Contemporary",
    status: "DRAFT",
    listPrice: 300,
    royaltyBps: 750,
    payoutAddress: "GCKFBEIYTKP3BPNM5Y72YOILXDGJ6ZV2IUCWQXQ7J3WYVZPQJM4Y3RK",
    description: "An ongoing draft analyzing visual weathering of geometric blocks when exposed to localized randomizing smart-contract iterations.",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&q=80",
  },
];

const MOCK_COLLECTIONS = [
  "Inaugural Drop — Meridian Contemporary",
  "Bodies in Transit",
  "Lagos Black Box: Open Season I",
];

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<ArtworkData[]>(INITIAL_ARTWORKS);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Drawer Edit state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Partial<ArtworkData> | null>(null);

  const handleOpenDrawer = (artwork?: ArtworkData) => {
    if (artwork) {
      setEditingArtwork({ ...artwork });
    } else {
      setEditingArtwork({
        id: `art-${Date.now().toString().slice(-4)}`,
        title: "",
        artist: "Maya Okonkwo",
        collection: "Inaugural Drop — Meridian Contemporary",
        status: "DRAFT",
        listPrice: 100,
        royaltyBps: 500,
        payoutAddress: "GCKFBEIYTKP3BPNM5Y72YOILXDGJ6ZV2IUCWQXQ7J3WYVZPQJM4Y3RK",
        description: "",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80",
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingArtwork(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingArtwork) return;
    const { name, value } = e.target;
    setEditingArtwork((prev) => ({
      ...prev,
      [name]: name === "listPrice" || name === "royaltyBps" ? Number(value) : value,
    }));
  };

  const handleSaveArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork?.title || !editingArtwork?.id) return;

    const savedData = editingArtwork as ArtworkData;
    const exists = artworks.some((art) => art.id === savedData.id);

    if (exists) {
      setArtworks((prev) => prev.map((art) => (art.id === savedData.id ? savedData : art)));
    } else {
      setArtworks((prev) => [savedData, ...prev]);
    }

    handleCloseDrawer();
    alert("Artwork parameters saved to database!");
  };

  const handleViewOnChain = (art: ArtworkData) => {
    alert(`Navigating to Stellar Expert for TX: ${art.metadataCid || "MOCKED_TX_HASH"}`);
  };

  // Filter Logic
  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollection = collectionFilter === "ALL" || art.collection === collectionFilter;
    const matchesStatus = statusFilter === "ALL" || art.status === statusFilter;
    return matchesSearch && matchesCollection && matchesStatus;
  });

  // Table Columns
  const tableColumns: Column<ArtworkData>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => <code className="text-xs font-mono font-bold text-[#1A3F6C]">{row.id}</code>,
    },
    {
      key: "title",
      header: "Artwork Title",
      render: (row) => (
        <span className="font-extrabold text-[#11181c] cursor-pointer hover:underline" onClick={() => handleOpenDrawer(row)}>
          {row.title}
        </span>
      ),
    },
    {
      key: "artist",
      header: "Artist",
      render: (row) => <span className="font-bold">{row.artist}</span>,
    },
    {
      key: "collection",
      header: "Exhibition Drop",
      render: (row) => <span className="text-xs font-bold text-[#11181c]/70">{row.collection}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} variant="artwork" />,
    },
    {
      key: "listPrice",
      header: "Price (XLM)",
      render: (row) => <span className="text-xs font-black text-[#1A3F6C]">{row.listPrice} XLM</span>,
    },
    {
      key: "royaltyBps",
      header: "Royalty Bps",
      render: (row) => (
        <span className="text-xs font-bold bg-[#1A3F6C]/10 text-[#1A3F6C] px-2 py-0.5">
          {row.royaltyBps} ({(row.royaltyBps / 100).toFixed(1)}%)
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenDrawer(row)} className="btn-neumorph px-2 py-1 text-xs font-bold">
            Configure
          </button>
          {row.status === "MINTED" && (
            <button onClick={() => handleViewOnChain(row)} className="btn-neumorph px-2 py-1 text-xs font-bold">
              Explorer
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Artwork Catalog & Listings
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Structure primary digital assets and secondary royalty splits
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Toggle View buttons */}
          <div className="flex items-center p-1 bg-black/5 border border-black/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 border-radius-0 ${
                viewMode === "grid" ? "bg-[#1A3F6C] text-[#f5f0ec]" : "text-[#1A3F6C] hover:bg-black/5"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 border-radius-0 ${
                viewMode === "table" ? "bg-[#1A3F6C] text-[#f5f0ec]" : "text-[#1A3F6C] hover:bg-black/5"
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenDrawer()}
            className="btn-neumorph py-2.5 px-4 font-bold text-sm gap-2 flex items-center"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>New Artwork</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card-neumorph p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1A3F6C]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search catalog, artist, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-neumorph w-full pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="field-label whitespace-nowrap mb-0">Collection:</label>
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="input-neumorph text-xs font-bold uppercase tracking-wider py-1.5"
            >
              <option value="ALL">All Drops</option>
              {MOCK_COLLECTIONS.map((c) => (
                <option key={c} value={c}>
                  {c.split(" — ")[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="field-label whitespace-nowrap mb-0">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-neumorph text-xs font-bold uppercase tracking-wider py-1.5"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="READY">Ready</option>
              <option value="LISTED">Listed</option>
              <option value="MINTED">Minted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid or Table list */}
      {viewMode === "grid" ? (
        filteredArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArtworks.map((art) => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                onEdit={handleOpenDrawer}
                onViewOnChain={handleViewOnChain}
              />
            ))}
          </div>
        ) : (
          <div className="card-neumorph p-12 text-center text-[#1A3F6C]/60">
            <span className="font-extrabold text-sm uppercase tracking-wider block">
              No matching artworks in directory
            </span>
          </div>
        )
      ) : (
        <div className="w-full">
          <DataTable columns={tableColumns} data={filteredArtworks} />
        </div>
      )}

      {/* EDITING / CONFIGURATION DRAWER */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#f5f0ec] z-50 transition-transform duration-300 overflow-y-auto ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: "-6px 0 20px rgba(229, 222, 217, 1)",
          borderLeft: "2px solid #1A3F6C",
        }}
      >
        {editingArtwork && (
          <form onSubmit={handleSaveArtwork} className="p-6 flex flex-col min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-[#1A3F6C]/60 uppercase tracking-widest block">
                  Configuration Drawer
                </span>
                <h3 className="text-base font-black text-[#1A3F6C] uppercase tracking-wider">
                  {editingArtwork.title ? "Configure Asset Details" : "Compile New Asset"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="p-1 hover:bg-black/5 text-[#1A3F6C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="field-label">Artwork Title</label>
                <input
                  type="text"
                  name="title"
                  value={editingArtwork.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Chromatic Dissolution No. 4"
                  className="input-neumorph w-full text-sm font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Artist Creator</label>
                  <select
                    name="artist"
                    value={editingArtwork.artist}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                  >
                    <option value="Maya Okonkwo">Maya Okonkwo</option>
                    <option value="Emre Demir">Emre Demir</option>
                    <option value="Lena Hartmann">Lena Hartmann</option>
                    <option value="Jin Park">Jin Park</option>
                    <option value="Sofia Reyes">Sofia Reyes</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Collection Drop</label>
                  <select
                    name="collection"
                    value={editingArtwork.collection}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                  >
                    {MOCK_COLLECTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.split(" — ")[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label">Artwork ID</label>
                <input
                  type="text"
                  name="id"
                  value={editingArtwork.id}
                  onChange={handleInputChange}
                  placeholder="art-1"
                  className="input-neumorph w-full text-xs font-mono font-bold bg-black/5 cursor-not-allowed"
                  disabled
                />
              </div>

              {editingArtwork.status === "MINTED" && (
                <div>
                  <label className="field-label">IPFS Metadata CID (Read-Only)</label>
                  <input
                    type="text"
                    name="metadataCid"
                    value={editingArtwork.metadataCid}
                    className="input-neumorph w-full text-xs font-mono bg-black/5 cursor-not-allowed"
                    disabled
                  />
                </div>
              )}

              <div>
                <label className="field-label">Creative Thesis & Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={editingArtwork.description}
                  onChange={handleInputChange}
                  placeholder="Narrative explanation of design workflow..."
                  className="input-neumorph w-full text-xs font-medium"
                />
              </div>

              {/* Status workflow dropdown */}
              <div>
                <label className="field-label">Listing Workflow State</label>
                <select
                  name="status"
                  value={editingArtwork.status}
                  onChange={handleInputChange}
                  className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                  disabled={editingArtwork.status === "MINTED"}
                >
                  <option value="DRAFT">DRAFT — Edit details offline</option>
                  <option value="READY">READY — Sign metadata package</option>
                  <option value="LISTED">LISTED — Publish to drop page</option>
                  {editingArtwork.status === "MINTED" && <option value="MINTED">MINTED — Immutable token on Stellar</option>}
                </select>
              </div>

              {/* Pricing and royalties block */}
              <div className="card-neumorph p-4 space-y-4">
                <span className="field-label border-b border-black/5 pb-1 block text-slate-700">
                  Pricing & Splitting Mechanics
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      List Price (XLM)
                    </label>
                    <input
                      type="number"
                      name="listPrice"
                      value={editingArtwork.listPrice}
                      onChange={handleInputChange}
                      min={0}
                      className="input-neumorph w-full text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="field-label flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Royalty (BPS)
                    </label>
                    <input
                      type="number"
                      name="royaltyBps"
                      value={editingArtwork.royaltyBps}
                      onChange={handleInputChange}
                      min={0}
                      max={10000}
                      className="input-neumorph w-full text-sm font-bold"
                    />
                    <span className="text-[9px] font-bold text-[#1A3F6C]/70 block mt-1 uppercase">
                      Equivalency: {((editingArtwork.royaltyBps || 0) / 100).toFixed(1)}% split
                    </span>
                  </div>
                </div>

                <div>
                  <label className="field-label flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5" />
                    Artist Payout Address
                  </label>
                  <input
                    type="text"
                    name="payoutAddress"
                    value={editingArtwork.payoutAddress}
                    onChange={handleInputChange}
                    className="input-neumorph w-full text-xs font-mono font-bold"
                    placeholder="GCKF..."
                  />
                </div>
              </div>

              {/* Upload image zone */}
              <div>
                <label className="field-label">Upload High-Fidelity Asset Media</label>
                <div className="card-neumorph p-3 border border-dashed border-[#1A3F6C]/20 flex flex-col items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-[#1A3F6C] opacity-75" />
                  <span className="text-[10px] font-bold block">Select high resolution PNG or video MP4</span>
                  <button type="button" className="btn-neumorph text-[10px] font-black py-1 px-3 mt-1">
                    Select Media
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/10 pt-4 mt-6 flex justify-between gap-4">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="btn-neumorph flex-1 py-2 font-bold text-xs uppercase"
              >
                Discard
              </button>
              <button
                type="submit"
                className="btn-neumorph flex-1 py-2 font-black uppercase tracking-widest text-[#f5f0ec] bg-[#1A3F6C] text-xs"
              >
                Save parameters
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Overlay backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={handleCloseDrawer}
        />
      )}
    </div>
  );
}
