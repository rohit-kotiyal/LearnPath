import { Rocket } from 'lucide-react';
 
export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <Rocket className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No sessions yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Create a new session to start coding together! 🚀
      </p>
    </div>
  );
}