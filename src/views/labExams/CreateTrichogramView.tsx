// src/views/labExams/CreateTrichogramView.tsx
import { PatientSelectionTab } from "@/components/labexam/PatientSelectionTab";
import { PaymentModal } from "@/components/payment/PaymentModal";

import {
  TrichogramHeader,
  TrichogramFooter,
  TrichogramExamTab,
  TrichogramResultsTab,
} from "@/components/labexam/trichogram";
import { useTrichogramForm } from "@/hooks/useTrichogramForm";
import ShareTrichogramResultsModal from "@/components/labexam/ShareTrichogramResultsModal";

export default function CreateTrichogramView() {
  const {
    form,
    activeTab,
    isClosing,
    showPaymentModal,
    showShareModal,
    savedExamData,
    examCostUSD,
    isPending,
    isPatientSelected,
    patientName,
    cost,
    discount,
    totalCost,
    currentTabIndex,
    handleTabChange,
    handleClose,
    handleClearPatient,
    handlePaymentConfirm,
    handleCloseShareModal,
    onSubmit,
    setShowPaymentModal,
    setActiveTab,
  } = useTrichogramForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Panel Fullscreen */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header */}
        <TrichogramHeader
          patientName={patientName}
          species={watch("species")}
          breed={watch("breed")}
          isPatientSelected={isPatientSelected}
          activeTab={activeTab}
          currentTabIndex={currentTabIndex}
          onClose={handleClose}
          onClearPatient={handleClearPatient}
          onTabChange={handleTabChange}
        />

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-32 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-200 dark:border-dark-100">
                {/* Tab Paciente */}
                {activeTab === "patient" && (
                  <PatientSelectionTab
                    onPatientSelected={() => setActiveTab("exam")}
                    setValues={setValue as any}
                    currentPatientName={watch("patientName")}
                  />
                )}

                {/* Tab Examen */}
                {activeTab === "exam" && (
                  <TrichogramExamTab
                    register={register}
                    errors={errors}
                    cost={cost}
                    discount={discount}
                    totalCost={totalCost}
                  />
                )}

                {/* Tab Resultados */}
                {activeTab === "results" && (
                  <TrichogramResultsTab
                    register={register}
                    watch={watch}
                    errors={errors}
                  />
                )}
              </div>
            </form>
          </div>
        </main>

        {/* Footer */}
        <TrichogramFooter
          activeTab={activeTab}
          currentTabIndex={currentTabIndex}
          isPatientSelected={isPatientSelected}
          isPending={isPending}
          onTabChange={handleTabChange}
          onSubmit={handleSubmit(onSubmit)}
        />
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
          amountUSD={examCostUSD}
          patient={{
            name: watch("patientName"),
          }}
        />
      )}

      {/* Modal Compartir/Imprimir PDF */}
      {showShareModal && savedExamData && (
        <ShareTrichogramResultsModal
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          examData={savedExamData}
          patientData={{
            name: watch("patientName"),
            species: watch("species"),
            breed: watch("breed"),
            owner: {
              name: watch("ownerName"),
              contact: watch("ownerPhone"),
            },
          }}
        />
      )}
    </>
  );
}