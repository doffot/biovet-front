// src/views/labExams/hooks/useLabExamList.ts

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLabExam, getAllLabExams } from "@/api/labExamAPI";
import { toast } from "@/components/Toast";

const ITEMS_PER_PAGE = 10;

export function useLabExamList() {
  const queryClient = useQueryClient();

  // ==================== STATE ====================
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ==================== QUERY ====================
  const {
    data: labExams = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["labExams"],
    queryFn: getAllLabExams,
  });

  // ==================== MUTATION ====================
  const { mutate: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLabExam(id),
    onSuccess: () => {
      toast.success("Examen eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al eliminar el examen");
    },
  });

  // ==================== FILTRADO ====================
  const filteredExams = useMemo(() => {
    return labExams.filter((exam) => {
      const matchesSearch =
        exam.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.breed?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies =
        speciesFilter === "all" ||
        exam.species.toLowerCase() === speciesFilter.toLowerCase();
      return matchesSearch && matchesSpecies;
    });
  }, [labExams, searchTerm, speciesFilter]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const total = labExams.length;
    const caninos = labExams.filter(
      (e) => e.species.toLowerCase() === "canino"
    ).length;
    const felinos = labExams.filter(
      (e) => e.species.toLowerCase() === "felino"
    ).length;
    const thisMonth = labExams.filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
    return { total, caninos, felinos, thisMonth };
  }, [labExams]);

  // ==================== PAGINACIÓN ====================
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentExams = filteredExams.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (filteredExams.length === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredExams.length, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, speciesFilter]);

  // ==================== HANDLERS ====================
  const handleDeleteClick = useCallback(
    (exam: { _id: string; patientName: string }) => {
      setExamToDelete({ id: exam._id, name: exam.patientName });
      setIsDeleteModalOpen(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    if (examToDelete) confirmDelete(examToDelete.id);
  }, [examToDelete, confirmDelete]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setExamToDelete(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSpeciesFilter("all");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = !!(searchTerm || speciesFilter !== "all");

  return {
    // State
    searchTerm,
    setSearchTerm,
    speciesFilter,
    setSpeciesFilter,
    currentPage,
    setCurrentPage,
    isDeleteModalOpen,
    examToDelete,

    // Data
    labExams,
    filteredExams,
    currentExams,
    stats,
    isLoading,
    isError,
    error,
    isDeleting,
    hasActiveFilters,

    // Pagination
    totalPages,
    startIndex,
    itemsPerPage: ITEMS_PER_PAGE,

    // Handlers
    handleDeleteClick,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleClearFilters,
  };
}