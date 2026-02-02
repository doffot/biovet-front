import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import type { OwnerFormData } from 'types/owner';
import type { OwnerFormInputs } from '@/components/owner/OwnerForm';
import OwnerForm from '@/components/owner/OwnerForm';

export default function CreateOwnerView() {
  const navigate = useNavigate();
  
  const initialValues: OwnerFormInputs = {
    name: '',
    countryCode: '+58',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormInputs>({
    defaultValues: initialValues,
  });

  const handleForm = async (formData: OwnerFormInputs) => {
    try {
      // Transformar datos del formulario al formato de la API
      const ownerData: OwnerFormData = {
        name: formData.name,
        contact: `${formData.countryCode}${formData.phone}`, // Concatenar código + número
        email: formData.email || null,
        address: formData.address || null,
        nationalId: formData.nationalId || null,
      };
      
      console.log('Datos para la API:', ownerData);
      
      // TODO: Llamada a la API
      // await createOwner(ownerData);
      // toast.success('Propietario creado exitosamente');
      // navigate('/owners');
      
    } catch (error) {
      console.error('Error al crear propietario:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-icon-neutral"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nuevo Propietario
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Registra un nuevo cliente en el sistema
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white dark:bg-dark-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Información del Propietario
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Los campos marcados con <span className="text-danger-500">*</span> son obligatorios
          </p>
        </div>

        <form onSubmit={handleSubmit(handleForm)} noValidate>
          <div className="p-6">
            <OwnerForm register={register} errors={errors} />
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-dark-200 border-t border-slate-200 dark:border-slate-800 rounded-b-xl flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              <Save size={18} />
              {isSubmitting ? 'Guardando...' : 'Guardar Propietario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}