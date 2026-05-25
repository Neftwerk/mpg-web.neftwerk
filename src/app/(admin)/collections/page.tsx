"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlusCircle, Search, X, Upload, MoveUp, MoveDown } from "lucide-react";

interface CollectionData {
  id: string;
  name: string;
  gallery: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "MINTED";
  artworkCount: number;
  created: string;
  shortDesc: string;
  longDesc: string;
  coverImage?: string;
  artworks: { id: string; title: string; artist: string }[];
}

const MOCK_COLLECTIONS: CollectionData[] = [
  {
    id: "col-101",
    name: "Inaugural Drop — Meridian Contemporary",
    gallery: "Meridian Contemporary",
    status: "MINTED",
    artworkCount: 3,
    created: "2026-01-10",
    shortDesc: "The debut collection exploring early modular algorithms on Stellar.",
    longDesc: "This historical drop establishes the foundations of the partnership, connecting generative artists with direct smart contract rewards.",
    artworks: [
      { id: "art-1", title: "Chromatic Dissolution No. 4", artist: "Maya Okonkwo" },
      { id: "art-3", title: "Sovereign Blue", artist: "Lena Hartmann" },
      { id: "art-4", title: "Erosion Study III", artist: "Maya Okonkwo" },
    ],
  },
  {
    id: "col-102",
    name: "Bodies in Transit",
    gallery: "Lagos Black Box",
    status: "PUBLISHED",
    artworkCount: 2,
    created: "2026-02-14",
    shortDesc: "A spatial study of movement and digital capture elements.",
    longDesc: "Bodies in Transit compiles video frame captures and vector reconstructions tracing human transit through global trade hubs.",
    artworks: [
      { id: "art-2", title: "Still Life with Protocol", artist: "Emre Demir" },
      { id: "art-5", title: "Threshold (After Meridian)", artist: "Emre Demir" },
    ],
  },
  {
    id: "col-103",
    name: "Lagos Black Box: Open Season I",
    gallery: "Lagos Black Box",
    status: "DRAFT",
    artworkCount: 0,
    created: "2026-04-01",
    shortDesc: "Incubated workshop artifacts from our inaugural performance lab.",
    longDesc: "Ongoing draft collection of physical performance pieces undergoing high-fidelity digital rendering.",
    artworks: [],
  },
];

const MOCK_ALL_ARTWORKS = [
  { id: "art-1", title: "Chromatic Dissolution No. 4", artist: "Maya Okonkwo" },
  { id: "art-2", title: "Still Life with Protocol", artist: "Emre Demir" },
  { id: "art-3", title: "Sovereign Blue", artist: "Lena Hartmann" },
  { id: "art-4", title: "Erosion Study III", artist: "Maya Okonkwo" },
  { id: "art-5", title: "Threshold (After Meridian)", artist: "Emre Demir" },
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionData[]>(MOCK_COLLECTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Drawer (right panel) State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Partial<CollectionData> | null>(null);

  // Search inside artwork membership list
  const [artworkSearch, setArtworkSearch] = useState("");

  const handleOpenDrawer = (collection?: CollectionData) => {
    if (collection) {
      setEditingCollection({ ...collection });
    } else {
      setEditingCollection({
        id: `col-${Date.now().toString().slice(-3)}`,
        name: "",
        gallery: "Meridian Contemporary",
        status: "DRAFT",
        artworkCount: 0,
        created: new Date().toISOString().split("T")[0],
        shortDesc: "",
        longDesc: "",
        artworks: [],
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingCollection(null);
    setArtworkSearch("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingCollection) return;
    const { name, value } = e.target;
    setEditingCollection((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "MINTED") => {
    if (!editingCollection) return;
    setEditingCollection((prev) => ({ ...prev, status }));
  };

  // Reordering inside membership list
  const moveArtwork = (index: number, direction: "up" | "down") => {
    if (!editingCollection?.artworks) return;
    const items = [...editingCollection.artworks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Swap
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    setEditingCollection((prev) => ({
      ...prev,
      artworks: items,
      artworkCount: items.length,
    }));
  };

  // Add/Remove artwork from collection
  const toggleArtworkMembership = (artwork: { id: string; title: string; artist: string }) => {
    if (!editingCollection?.artworks) return;
    const exists = editingCollection.artworks.some((a) => a.id === artwork.id);
    let updatedList;
    if (exists) {
      updatedList = editingCollection.artworks.filter((a) => a.id !== artwork.id);
    } else {
      updatedList = [...editingCollection.artworks, artwork];
    }
    setEditingCollection((prev) => ({
      ...prev,
      artworks: updatedList,
      artworkCount: updatedList.length,
    }));
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection?.name || !editingCollection?.id) {
      alert("Name is required.");
      return;
    }

    const savedData = editingCollection as CollectionData;
    const exists = collections.some((c) => c.id === savedData.id);

    if (exists) {
      setCollections((prev) => prev.map((c) => (c.id === savedData.id ? savedData : c)));
    } else {
      setCollections((prev) => [savedData, ...prev]);
    }

    handleCloseDrawer();
    alert("Collection compiled successfully.");
  };

  // Filters
  const filteredCollections = collections.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.gallery.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGallery = galleryFilter === "ALL" || c.gallery === galleryFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesGallery && matchesStatus;
  });

  const columns: Column<CollectionData>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => <code className="text-xs font-bold text-[#1A3F6C]">{row.id}</code>,
    },
    {
      key: "name",
      header: "Collection Name",
      render: (row) => (
        <span className="font-extrabold text-[#11181c] hover:underline" onClick={() => handleOpenDrawer(row)}>
          {row.name}
        </span>
      ),
    },
    {
      key: "gallery",
      header: "Curating Gallery",
      render: (row) => <span className="text-xs font-bold text-[#11181c]/70">{row.gallery}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} variant="artwork" />,
    },
    {
      key: "artworkCount",
      header: "Artworks",
      render: (row) => (
        <span className="text-xs font-black bg-[#1A3F6C]/10 text-[#1A3F6C] px-2 py-0.5">
          {row.artworkCount} Items
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (row) => <span className="text-xs font-bold">{row.created}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button onClick={() => handleOpenDrawer(row)} className="btn-neumorph px-2 py-1 text-xs font-bold">
          Configure
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Collections & Drops
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Structure and sequence curated gallery exhibitions
          </p>
        </div>

        <button
          onClick={() => handleOpenDrawer()}
          className="btn-neumorph py-2.5 px-4 font-bold text-sm gap-2 flex items-center self-start sm:self-auto"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-neumorph p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1A3F6C]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-neumorph w-full pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="field-label whitespace-nowrap mb-0">Gallery:</label>
            <select
              value={galleryFilter}
              onChange={(e) => setGalleryFilter(e.target.value)}
              className="input-neumorph text-xs font-bold uppercase tracking-wider py-1.5"
            >
              <option value="ALL">All Galleries</option>
              <option value="Meridian Contemporary">Meridian Contemporary</option>
              <option value="Lagos Black Box">Lagos Black Box</option>
              <option value="Forma Gallery Berlin">Forma Gallery Berlin</option>
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
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
              <option value="MINTED">Minted</option>
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="w-full">
        <DataTable columns={columns} data={filteredCollections} />
      </div>

      {/* RIGHT SIDE DRAWER PANEL - zero rounded corners, bold neumorphism */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#f5f0ec] z-50 transition-transform duration-300 overflow-y-auto ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: "-6px 0 20px rgba(229, 222, 217, 1)",
          borderLeft: "2px solid #1A3F6C",
        }}
      >
        {editingCollection && (
          <form onSubmit={handleSaveCollection} className="p-6 flex flex-col min-h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-[#1A3F6C]/60 uppercase tracking-widest block">
                  Configuration Drawer
                </span>
                <h3 className="text-base font-black text-[#1A3F6C] uppercase tracking-wider">
                  {editingCollection.name ? "Edit Collection" : "Assemble Collection"}
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

            {/* Drawer Form Fields */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="field-label">Collection Title</label>
                <input
                  type="text"
                  name="name"
                  value={editingCollection.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Inaugural Drop"
                  className="input-neumorph w-full text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="field-label">Curating Gallery Partner</label>
                <select
                  name="gallery"
                  value={editingCollection.gallery}
                  onChange={handleInputChange}
                  className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                >
                  <option value="Meridian Contemporary">Meridian Contemporary</option>
                  <option value="Lagos Black Box">Lagos Black Box</option>
                  <option value="Forma Gallery Berlin">Forma Gallery Berlin</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="field-label mb-0">Short Pitch/Teaser</label>
                  <span className="text-[10px] font-bold text-[#1A3F6C]/60">
                    {(editingCollection.shortDesc || "").length}/160 Chars
                  </span>
                </div>
                <input
                  type="text"
                  name="shortDesc"
                  maxLength={160}
                  value={editingCollection.shortDesc}
                  onChange={handleInputChange}
                  placeholder="Short summary for preview pages..."
                  className="input-neumorph w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="field-label">Extended Description</label>
                <textarea
                  name="longDesc"
                  rows={3}
                  value={editingCollection.longDesc}
                  onChange={handleInputChange}
                  placeholder="In-depth exhibition notes or curation manifesto..."
                  className="input-neumorph w-full text-xs font-medium"
                />
              </div>

              {/* Status Segmented Control */}
              <div>
                <label className="field-label">Status Flow state</label>
                <div className="grid grid-cols-4 bg-black/5 p-1 border border-black/5">
                  {(["DRAFT", "PUBLISHED", "ARCHIVED", "MINTED"] as const).map((status) => {
                    const isSelected = editingCollection.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(status)}
                        className={`text-[9px] font-black uppercase tracking-wider py-2 text-center border-radius-0 transition-all ${
                          isSelected
                            ? "bg-[#1A3F6C] text-[#f5f0ec] shadow-md"
                            : "text-[#11181c]/70 hover:bg-black/5"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover Image upload and preview */}
              <div>
                <label className="field-label">Exhibition Hero Cover Image</label>
                <div className="card-neumorph p-3 border border-dashed border-[#1A3F6C]/20 flex flex-col items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-[#1A3F6C] opacity-75" />
                  <span className="text-[10px] font-bold block text-center">PNG, JPG up to 15MB</span>
                  <button type="button" className="btn-neumorph text-[10px] font-black py-1 px-3 mt-1">
                    Select Hero File
                  </button>
                </div>
              </div>

              {/* Membership & Drag-to-reorder list */}
              <div className="space-y-3">
                <span className="field-label">Exhibition Membership ({editingCollection.artworks?.length || 0} Artworks)</span>

                {/* Sub search list */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#1A3F6C]/60">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search catalog to add/remove..."
                    value={artworkSearch}
                    onChange={(e) => setArtworkSearch(e.target.value)}
                    className="input-neumorph w-full pl-8 text-xs py-1.5"
                  />
                </div>

                {/* Catalogue Selection Grid */}
                {artworkSearch && (
                  <div className="card-neumorph p-2 max-h-[140px] overflow-y-auto space-y-1.5 bg-black/[0.02]">
                    {MOCK_ALL_ARTWORKS.filter((art) =>
                      art.title.toLowerCase().includes(artworkSearch.toLowerCase()) || art.artist.toLowerCase().includes(artworkSearch.toLowerCase())
                    ).map((art) => {
                      const isAdded = editingCollection.artworks?.some((a) => a.id === art.id);
                      return (
                        <div key={art.id} className="flex justify-between items-center text-xs p-1.5 bg-[#f5f0ec] border border-black/5">
                          <div>
                            <span className="font-bold block text-[#11181c]">{art.title}</span>
                            <span className="text-[9px] font-bold text-[#1A3F6C]/70 block">{art.artist}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleArtworkMembership(art)}
                            className="btn-neumorph text-[9px] py-0.5 px-2 font-bold uppercase"
                          >
                            {isAdded ? "Remove" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Orderable Current Members */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase text-[#1A3F6C]/60 tracking-wider block">
                    Current Sequence (Drag-reorder mock via actions)
                  </span>
                  <div className="card-neumorph-inset p-2 max-h-[220px] overflow-y-auto divide-y divide-black/5 bg-[#f2ede9]">
                    {editingCollection.artworks && editingCollection.artworks.length > 0 ? (
                      editingCollection.artworks.map((art, index) => (
                        <div key={art.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-extrabold text-[#11181c] block">{index + 1}. {art.title}</span>
                            <span className="text-[9px] font-bold text-[#1A3F6C]/70 block">{art.artist}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveArtwork(index, "up")}
                              disabled={index === 0}
                              className="btn-neumorph p-1 disabled:opacity-30"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveArtwork(index, "down")}
                              disabled={index === (editingCollection.artworks?.length || 0) - 1}
                              className="btn-neumorph p-1 disabled:opacity-30"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-center block py-4 text-slate-400">
                        No artworks assigned to this exhibition.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
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
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Drawer Overlay backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={handleCloseDrawer}
        />
      )}
    </div>
  );
}
