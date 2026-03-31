import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import AddressForm from '../../components/checkout/AddressForm';
import PaymentForm from '../../components/checkout/PaymentForm';
import OrderSummary from '../../components/checkout/OrderSummary';
import Loader from '../../components/common/Loader';

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 200;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, fetchCart, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const subtotal = total;
  const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const orderTotal = subtotal + shippingFee;

  useEffect(() => {
    const init = async () => {
      try {
        await fetchCart();
        const { data } = await api.get('/users/addresses');
        const addrs = data.addresses || [];
        setAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddress(addrs[0]._id);
        }
      } catch (error) {
        console.error('Failed to load checkout data:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchCart]);

  const handleAddNewAddress = async (addressData) => {
    try {
      const { data } = await api.post('/users/addresses', addressData);
      const newAddress = data.address;
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddress(newAddress._id);
      toast.success('Address added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      const shippingAddress = addresses.find((a) => a._id === selectedAddress);

      const { data } = await api.post('/orders', {
        shippingAddress,
        paymentMethod,
      });

      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const { data: sessionData } = await api.post('/payments/create-checkout-session', {
          orderId: data.order._id,
        });
        // Redirect to Stripe
        window.location.href = sessionData.url;
        return;
      }

      // COD flow
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nothing to Checkout</h1>
        <p className="text-gray-500 mb-6">Your cart is empty. Add some items first.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <AddressForm
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelect={setSelectedAddress}
              onAddNew={handleAddNewAddress}
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <PaymentForm paymentMethod={paymentMethod} onChange={setPaymentMethod} />
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              total={orderTotal}
              paymentMethod={paymentMethod}
              onPlaceOrder={handlePlaceOrder}
            />
            {placing && (
              <div className="mt-3 text-center">
                <Loader size="sm" />
                <p className="text-sm text-gray-500 mt-1">Processing your order...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
