// src/components/DebugBorders.tsx
import { useEffect } from 'react';

export const DebugBorders = () => {
  useEffect(() => {
    // Función para añadir bordes a todos los elementos
    const addBorders = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const element = el as HTMLElement;
        // Añadimos un borde rojo fino a cada elemento
        element.style.outline = '1px solid red';
        element.style.outlineOffset = '-1px'; // Para que el borde no aumente el tamaño
      });
    };

    // Ejecutamos la función después de que el componente se monte
    addBorders();

    // Limpiamos los estilos cuando el componente se desmonta
    return () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const element = el as HTMLElement;
        element.style.outline = '';
        element.style.outlineOffset = '';
      });
    };
  }, []);

  return null; // Este componente no renderiza nada visible por sí mismo
};