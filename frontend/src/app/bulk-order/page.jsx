import BulkOrderForm from '@/components/BulkOrder/BulkOrderForm';

export const metadata = {
  title: 'Bulk Order - BigBest Mart',
  description: 'Place bulk orders and get the best wholesale prices. Perfect for businesses, retailers, and bulk buyers.',
};

export default function BulkOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <BulkOrderForm />
      </div>
    </div>
  );
}