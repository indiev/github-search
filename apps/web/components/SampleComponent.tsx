export default function SampleComponent({ title }: { title: string }) {
  return (
    <div className="p-4 border rounded shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        This is a sample component for Cypress Component Testing.
      </p>
    </div>
  );
}
