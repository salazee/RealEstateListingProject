import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInquiryById, respondToInquiry } from '../../utils/Property';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function RespondToInquiry() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInquiry();
  }, [id]);

  const fetchInquiry = async () => {
    try {
      const res = await getInquiryById(id);
      console.log('Fetched inquiry:', res.data); 
      setInquiry(res.data.inquiry);

      if (res.data.inquiry.status !== 'pending') {
        toast.error('This inquiry has already been responded to');
        navigate('/sellerinquiries');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load inquiry');
      console.error('Error response:', error.response?.data);
      navigate('/sellerinquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reply.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setSending(true);
      console.log('Sending reply:', { id, reply });


      const res = await respondToInquiry(id, reply);
      console.log('Response:', res.data);

      setInquiry(res.data.inquiry || inquiry);
      toast.success('Reply sent successfully');

      setTimeout(() => {
        navigate('/sellerinquiries');
      }, 2000);

    } catch (error) {
      console.error('Response error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to send reply'
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiry...</p>
        </div>
      </div>
    );
  }

  
  if (!inquiry) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Inquiry not found</p>
          <button
            onClick={() => navigate('/sellerinquiries')}
            className="text-blue-600 hover:underline"
          >
            Back to Inquiries
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={() => navigate('/sellerinquiries')}
        className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Inquiries
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Respond to Inquiry</h1>

        {/* Property Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-2">{inquiry.property?.title}</h3>
          <p className="text-gray-600 text-sm">{inquiry.property?.location}</p>
          <p className="text-blue-600 font-bold mt-2">₦{inquiry.property?.price?.toLocaleString()}</p>
        </div>

        {/* Buyer Message */}
        <div className="border-l-4 border-blue-600 bg-blue-50 p-4 mb-6">
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-gray-700">
              {inquiry.buyer?.name || 'Buyer'}
            </p>
            <span className="text-xs text-gray-500">
              {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <p className="text-gray-700">{inquiry.message}</p>
        </div>
        {/* Buyer Contact Info */}
          {inquiry.buyer?.email && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-600">
                Buyer Email: <a href={`mailto:${inquiry.buyer.email}`} className="text-blue-600 underline">{inquiry.buyer.email}</a>
              </p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Response
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your reply to the buyer..."
            disabled={sending}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={sending}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className={`px-6 py-2 rounded-lg text-white ${
                sending || !reply.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    
  );
}
