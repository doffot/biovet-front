import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLabExams, deleteLabExam } from "../../api/labExamAPI";
import {
  Plus,
  ArrowLeft,
  Eye,
  Trash2,
  FlaskConical,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  PawPrint,
  Microscope,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "../../components/Toast";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function LabExamListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const itemsPerPage = 5;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<{ id: string; name: string } | null>(null);

  const {
     data:labExams = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["labExams"],
    queryFn: getAllLabExams,
  });

  const { mutate: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLabExam(id),
    onSuccess: () => {
      toast.success("Examen eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el examen");
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleDeleteClick = (exam: { _id: string; patientName: string }) => {
    setExamToDelete({ id: exam._id, name: exam.patientName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (examToDelete) {
      confirmDelete(examToDelete.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getHematocritStatus = (value: number, species: string) => {
    const ranges = {
      canino: [37, 55],
      felino: [30, 45],
    };
    const range = species.toLowerCase() === "felino" ? ranges.felino : ranges.canino;
    if (value < range[0]) return "low";
    if (value > range[1]) return "high";
    return "normal";
  };

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  const stats = useMemo(() => {
    const total = labExams.length;
    const caninos = labExams.filter((e) => e.species.toLowerCase() === "canino").length;
    const felinos = labExams.filter((e) => e.species.toLowerCase() === "felino").length;
    const thisMonth = labExams.filter((e) => {
      const examDate = new Date(e.date);
      const now = new Date();
      return examDate.getMonth() === now.getMonth() && examDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, caninos, felinos, thisMonth };
  }, [labExams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vet-light flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-vet-muted/30 border-t-vet-primary rounded-full animate-spin" />
            <FlaskConical className="w-6 h-6 text-vet-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-vet-text font-medium font-montserrat">Cargando exámenes...</p>
          <p className="text-vet-muted text-sm mt-1">Por favor espere</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-vet-light flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl p-8 shadow-card max-w-md text-center relative overflow-hidden border border-border">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-vet-danger via-vet-danger to-vet-danger" />
          <div className="w-16 h-16 mx-auto mb-4 bg-vet-danger/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-vet-danger" />
          </div>
          <h2 className="text-xl font-bold text-vet-text mb-2 font-montserrat">Error al cargar</h2>
          <p className="text-vet-muted text-sm mb-6">{error?.message || "No se pudieron cargar los exámenes"}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-vet-primary text-white rounded-xl font-semibold hover:bg-vet-secondary transition-all duration-200 shadow-soft hover:shadow-card flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vet-light transition-colors duration-300">
      <header className="bg-card shadow-soft border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 rounded-xl bg-hover text-vet-accent hover:bg-vet-primary/20 transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </Link>

              <div className="hidden sm:block h-8 w-px bg-border" />

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-vet-text font-montserrat leading-tight">
                    Exámenes de Laboratorio
                  </h1>
                  <p className="text-xs text-vet-muted">
                    {stats.total} examen{stats.total !== 1 ? "es" : ""} registrado{stats.total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vet-primary text-white font-semibold hover:bg-vet-secondary transition-all duration-200 shadow-soft hover:shadow-card text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Examen</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <StatCard icon={FileText} label="Total" value={stats.total} variant="primary" />
          <StatCard icon={PawPrint} label="Caninos" value={stats.caninos} variant="secondary" />
          <StatCard icon={PawPrint} label="Felinos" value={stats.felinos} variant="accent" />
          <StatCard icon={Calendar} label="Este Mes" value={stats.thisMonth} variant="light" />
        </div>

        <div
          className={`bg-card rounded-2xl shadow-soft border border-border overflow-hidden transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="p-4 border-b border-border bg-vet-light/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o raza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-vet-text placeholder:text-vet-muted focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all"
                />
              </div>

              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-vet-text focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">Todas especies</option>
                <option value="canino">Caninos</option>
                <option value="felino">Felinos</option>
              </select>
            </div>

            {(searchTerm || speciesFilter !== "all") && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                <span className="text-xs text-vet-muted">Filtros:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-vet-primary/10 text-vet-primary rounded-lg text-xs font-medium">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-vet-secondary ml-1">
                      ×
                    </button>
                  </span>
                )}
                {speciesFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-vet-primary/10 text-vet-primary rounded-lg text-xs font-medium capitalize">
                    {speciesFilter}
                    <button onClick={() => setSpeciesFilter("all")} className="hover:text-vet-secondary ml-1">
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSpeciesFilter("all");
                  }}
                  className="text-xs text-vet-muted hover:text-vet-primary transition-colors ml-2"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>

          {currentExams.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-vet-light border-b border-border">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider hidden sm:table-cell">
                        Especie
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider hidden md:table-cell">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Hematocrito
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-vet-muted uppercase tracking-wider hidden lg:table-cell">
                        Leucocitos
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentExams.map((exam, index) => {
                      const hematocritStatus = getHematocritStatus(exam.hematocrit, exam.species);
                      const isAltered = hematocritStatus !== "normal";

                      return (
                        <tr
                          key={exam._id}
                          className={`hover:bg-hover transition-colors ${
                            isAltered ? "bg-red-500/5" : ""
                          }`}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  exam.species.toLowerCase() === "felino"
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                <PawPrint className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-vet-text font-montserrat truncate">
                                  {exam.patientName}
                                </p>
                                <p className="text-xs text-vet-muted truncate">{exam.breed || "Sin raza"}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                exam.species.toLowerCase() === "felino"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              {exam.species}
                            </span>
                          </td>

                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm text-vet-muted">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(exam.date)}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-lg font-bold ${
                                  isAltered ? "text-red-500" : "text-vet-primary"
                                }`}
                              >
                                {exam.hematocrit}%
                              </span>
                              {isAltered && (
                                <span className="text-xs mt-0.5 text-red-500 font-medium">
                                  {hematocritStatus === "low" ? "↓ Bajo" : "↑ Alto"}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center hidden lg:table-cell">
                            <span className="text-sm font-medium text-vet-text">
                              {exam.whiteBloodCells}
                              <span className="text-vet-muted text-xs ml-1">x10³/μL</span>
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                to={`${exam._id}`}
                                className="p-2 rounded-lg bg-hover text-vet-primary hover:bg-vet-primary hover:text-white transition-all duration-200"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  if (exam._id && exam.patientName) {
                                    handleDeleteClick({ _id: exam._id, patientName: exam.patientName });
                                  }
                                }}
                                className="p-2 rounded-lg bg-hover text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border bg-vet-light flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-vet-muted">
                    Mostrando{" "}
                    <span className="font-semibold text-vet-text">{startIndex + 1}</span> -{" "}
                    <span className="font-semibold text-vet-text">
                      {Math.min(startIndex + itemsPerPage, filteredExams.length)}
                    </span>{" "}
                    de <span className="font-semibold text-vet-text">{filteredExams.length}</span> exámenes
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === 1
                          ? "bg-hover text-vet-muted/50 cursor-not-allowed"
                          : "bg-card border border-border text-vet-primary hover:bg-vet-primary hover:text-white"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrentPage = currentPage === pageNum;

                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                isCurrentPage
                                  ? "bg-vet-primary text-white shadow-soft"
                                  : "bg-card border border-border text-vet-text hover:border-vet-primary hover:text-vet-primary"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="text-vet-muted px-1">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === totalPages
                          ? "bg-hover text-vet-muted/50 cursor-not-allowed"
                          : "bg-card border border-border text-vet-primary hover:bg-vet-primary hover:text-white"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-vet-light rounded-full flex items-center justify-center border border-border">
                <Microscope className="w-10 h-10 text-vet-muted" />
              </div>

              {labExams.length === 0 ? (
                <>
                  <h3 className="text-xl font-bold text-vet-text mb-2 font-montserrat">
                    No hay exámenes registrados
                  </h3>
                  <p className="text-vet-muted mb-8 max-w-md mx-auto">
                    Comienza registrando el primer examen de hematología para tus pacientes.
                  </p>
                  <Link
                    to="create"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-soft hover:shadow-card transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Primer Examen
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-vet-text mb-2 font-montserrat">
                    No se encontraron resultados
                  </h3>
                  <p className="text-vet-muted mb-6">Intenta ajustar los filtros de búsqueda</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSpeciesFilter("all");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-vet-primary hover:bg-vet-primary hover:text-white transition-all font-medium"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExamToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Examen"
        message={
          <p className="text-vet-text">
            ¿Estás seguro de que deseas eliminar el examen de{" "}
            <span className="font-bold text-vet-danger">
              {examToDelete?.name}
            </span>? 
            Esta acción no se puede deshacer.
          </p>
        }
        variant="danger"
        confirmText="Eliminar Examen"
        confirmIcon={Trash2}
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  variant: "primary" | "secondary" | "accent" | "light";
}

function StatCard({ icon: Icon, label, value, variant }: StatCardProps) {
  const variantClasses = {
    primary: {
      bg: "bg-card",
      iconBg: "bg-vet-primary/10",
      icon: "text-vet-primary",
      value: "text-vet-primary",
    },
    secondary: {
      bg: "bg-card",
      iconBg: "bg-vet-secondary/10",
      icon: "text-vet-secondary",
      value: "text-vet-secondary",
    },
    accent: {
      bg: "bg-card",
      iconBg: "bg-vet-accent/10",
      icon: "text-vet-accent",
      value: "text-vet-secondary",
    },
    light: {
      bg: "bg-card",
      iconBg: "bg-vet-light",
      icon: "text-vet-primary",
      value: "text-vet-text",
    },
  };

  const classes = variantClasses[variant];

  return (
    <div className={`${classes.bg} rounded-2xl p-4 shadow-soft border border-border hover:shadow-card transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${classes.iconBg}`}>
          <Icon className={`w-5 h-5 ${classes.icon}`} />
        </div>
        <div>
          <p className="text-xs text-vet-muted font-medium">{label}</p>
          <p className={`text-xl font-bold ${classes.value} font-montserrat`}>{value}</p>
        </div>
      </div>
    </div>
  );
}