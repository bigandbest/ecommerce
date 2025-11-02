import { FaCheck, FaTimes, FaTruck, FaBox, FaClock } from 'react-icons/fa';
import { useOrderTracking } from '@/hooks/useOrderTracking';

const TrackingProgress = ({ order }) => {
  const { orderStatus, isConnected } = useOrderTracking(order.id, order.status);

  const getProgressSteps = () => {
    if (orderStatus === 'cancelled') {
      return [
        { key: 'pending', label: 'Order Placed', icon: FaCheck, date: order.created_at },
        { key: 'cancelled', label: 'Cancelled', icon: FaTimes, isError: true }
      ];
    }

    return [
      { key: 'pending', label: 'Order Placed', icon: FaCheck, date: order.created_at },
      { key: 'processing', label: 'Processing', icon: FaClock },
      { key: 'confirmed', label: 'Confirmed', icon: FaCheck },
      { key: 'shipped', label: 'Shipped', icon: FaTruck },
      { key: 'delivered', label: 'Delivered', icon: FaBox }
    ];
  };

  const getStepStatus = (stepKey) => {
    const statusOrder = ['pending', 'processing', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (orderStatus === 'cancelled') {
      return stepKey === 'pending' || stepKey === 'cancelled' ? 'completed' : 'inactive';
    }
    
    return stepIndex <= currentIndex ? 'completed' : 'inactive';
  };

  const steps = getProgressSteps();
  const completedSteps = steps.filter(s => getStepStatus(s.key) === 'completed').length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Tracking Progress</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-600">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="relative pb-4">
        <div className="absolute left-4 top-8 w-0.5 bg-gray-200" style={{height: `${(steps.length - 1) * 56}px`}}></div>
        <div 
          className={`absolute left-4 top-8 w-0.5 transition-all duration-500 ${
            orderStatus === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
          }`} 
          style={{height: `${Math.max(0, (completedSteps - 1) * 56)}px`}}
        ></div>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key);
            const IconComponent = step.icon;
            
            return (
              <div key={step.key} className="flex items-center gap-3 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                  status === 'completed' 
                    ? step.isError ? 'bg-red-500' : 'bg-green-500'
                    : 'bg-gray-300'
                }`}>
                  <IconComponent className={`text-sm ${
                    status === 'completed' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className={`font-medium text-sm ${
                    status === 'completed' 
                      ? step.isError ? 'text-red-700' : 'text-green-700'
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-gray-600">
                      {new Date(step.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingProgress;