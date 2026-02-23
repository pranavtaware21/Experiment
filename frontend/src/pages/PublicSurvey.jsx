import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { FaGripVertical, FaCheckCircle } from 'react-icons/fa';

export default function PublicSurvey() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await API.get(`/surveys/${id}/public`);
        setSurvey(res.data.survey);
      } catch (err) {
        setError(err.response?.data?.message || 'Survey not found');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleCheckboxAnswer = (questionId, option) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const updated = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!survey) return;

    const required = survey.questions.filter((q) => q.required);
    for (const q of required) {
      const a = answers[q.id];
      if (!a || (Array.isArray(a) && a.length === 0) || (typeof a === 'string' && !a.trim())) {
        setError(`Please answer: "${q.text}"`);
        setCurrentPage(q.page || 1);
        return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      await API.post(`/surveys/${id}/respond`, { answers });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const getPageQuestions = (pageNum) =>
    (survey?.questions || []).filter((q) => (q.page || 1) === pageNum);

  const getPages = () => {
    if (!survey) return [];
    const maxPage = Math.max(...survey.questions.map((q) => q.page || 1), 1);
    return Array.from({ length: maxPage }, (_, i) => i + 1);
  };

  const getPageMeta = (pageNum) => {
    if (!survey?.pages || !Array.isArray(survey.pages)) return null;
    return survey.pages[pageNum - 1] || null;
  };

  const pages = getPages();
  const totalPages = pages.length;
  const isLastPage = currentPage === totalPages;
  const pageQuestions = getPageQuestions(currentPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="glass-light rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-[100px]" />
        <div className="glass-light rounded-2xl p-8 text-center max-w-md relative z-10 glow-sm">
          <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-text-dark">Response Submitted</h1>
          <p className="text-text/60">{survey?.endMessage || 'Thank you for completing this survey!'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8 relative overflow-hidden">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-accent/10 rounded-full blur-[100px]" />

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        <div className="glass-light rounded-2xl p-6 sm:p-8 glow-sm">
          {/* Survey header */}
          <h1 className="text-2xl font-bold mb-1 text-text-dark">{survey.title}</h1>
          {survey.description && <p className="text-text/60 mb-6">{survey.description}</p>}

          {/* Progress bar */}
          {totalPages > 1 && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-text/50 mb-1">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              <div className="h-1.5 bg-text-dark/5 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          {/* Page title/description */}
          {(() => {
            const meta = getPageMeta(currentPage);
            if (!meta) return null;
            return (
              <div className="mb-6">
                {meta.title && <h2 className="text-lg font-semibold text-text-dark mb-1">{meta.title}</h2>}
                {meta.description && <p className="text-sm text-text/60">{meta.description}</p>}
              </div>
            );
          })()}

          {/* Questions */}
          <div className="space-y-6">
            {pageQuestions.map((q, idx) => (
              <div key={q.id} className="pb-5 border-b border-border/20 last:border-b-0">
                <p className="text-sm font-medium text-text-dark mb-3">
                  {idx + 1}. {q.text}
                  {q.required && <span className="text-red-400 ml-1">*</span>}
                </p>

                {q.type === 'radio' && (
                  <div className="space-y-2 ml-4">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm text-text/70 cursor-pointer hover:text-text-dark transition-colors">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswer(q.id, opt)}
                          className="accent-primary"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'checkbox' && (
                  <div className="space-y-2 ml-4">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm text-text/70 cursor-pointer hover:text-text-dark transition-colors">
                        <input
                          type="checkbox"
                          checked={(answers[q.id] || []).includes(opt)}
                          onChange={() => toggleCheckboxAnswer(q.id, opt)}
                          className="accent-primary"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'rating' && (
                  <div className="flex gap-2 ml-4">
                    {Array.from({ length: q.ratingScale || 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAnswer(q.id, String(i + 1))}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${
                          answers[q.id] === String(i + 1)
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30'
                            : 'border-border/30 text-text/50 hover:border-primary hover:text-primary bg-transparent'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'text' && (
                  <div className="ml-4">
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={3}
                      className="w-full px-3 py-2 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark placeholder-text/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                )}

                {q.type === 'dropdown' && (
                  <div className="ml-4">
                    <select
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className="w-full px-3 py-2 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                    >
                      <option value="" className="bg-surface">Select an option...</option>
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt} className="bg-surface">{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {q.type === 'ranking' && (
                  <div className="space-y-2 ml-4">
                    <p className="text-xs text-text/40 mb-1">Drag to reorder (or click to rank 1st)</p>
                    {(answers[q.id] || q.options).map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          const current = answers[q.id] || [...q.options];
                          const idx = current.indexOf(opt);
                          if (idx > 0) {
                            const updated = [...current];
                            updated.splice(idx, 1);
                            updated.unshift(opt);
                            setAnswer(q.id, updated);
                          }
                        }}
                        className="flex items-center gap-2 bg-text-dark/5 hover:bg-text-dark/10 rounded-lg px-3 py-2 text-sm text-text/70 cursor-pointer transition-colors border border-border/20"
                      >
                        <FaGripVertical size={10} className="text-text/30" />
                        <span className="text-text/40 mr-1">{i + 1}.</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {currentPage > 1 ? (
              <button
                onClick={() => { setCurrentPage((p) => p - 1); setError(''); }}
                className="px-5 py-2.5 rounded-xl font-medium border border-border/30 bg-transparent text-text/60 hover:bg-text-dark/5 hover:text-text-dark transition-colors cursor-pointer"
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {isLastPage ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer border-none"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                onClick={() => { setCurrentPage((p) => p + 1); setError(''); }}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer border-none"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
