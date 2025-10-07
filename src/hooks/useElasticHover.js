import { useEffect, useRef } from 'react';

export default function useElasticHover(forwardedRef) {
  const innerRef = useRef(null);
  const ref = forwardedRef || innerRef;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMove = (e) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      node.style.transform = `perspective(600px) rotateX(${y * 10}deg) rotateY(${-x * 10}deg)`;
    };

    const reset = () => {
      node.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
    };

    node.addEventListener('mousemove', handleMove);
    node.addEventListener('mouseleave', reset);
    return () => {
      node.removeEventListener('mousemove', handleMove);
      node.removeEventListener('mouseleave', reset);
    };
  }, []);

  return ref;
}
