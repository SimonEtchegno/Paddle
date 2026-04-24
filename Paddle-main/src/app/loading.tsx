import { LoadingPro } from '@/components/ui/LoadingPro';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center">
      <LoadingPro />
    </div>
  );
}
