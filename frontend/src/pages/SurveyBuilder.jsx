import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  FaRegDotCircle, FaRegCheckSquare, FaRegStar, FaAlignLeft,
  FaCaretSquareDown, FaSortAmountDown, FaUndo, FaRedo,
  FaSlidersH, FaPlus, FaMinus, FaTimes, FaEllipsisH, FaTrash,
  FaGripVertical, FaArrowRight,
} from 'react-icons/fa';

/* ── question type definitions ── */
const QUESTION_TYPES = [
  { type: 'radio', icon: FaRegDotCircle, label: 'Single Choice' },
  { type: 'checkbox', icon: FaRegCheckSquare, label: 'Multiple Choice' },
  { type: 'rating', icon: FaRegStar, label: 'Rating' },
  { type: 'text', icon: FaAlignLeft, label: 'Text' },
  { type: 'dropdown', icon: FaCaretSquareDown, label: 'Dropdown' },
  { type: 'ranking', icon: FaSortAmountDown, label: 'Ranking' },
];

let _qid = 1;
const genId = () => `q-${_qid++}-${Date.now()}`;

const defaultQuestion = (type, pageNum) => ({
  id: genId(),
  type,
  text: '',
  required: false,
  page: pageNum,
  options: ['radio', 'checkbox', 'dropdown', 'ranking'].includes(type)
    ? ['Option 1', 'Option 2', 'Option 3']
    : [],
  ratingScale: type === 'rating' ? 5 : undefined,
});

/* ================================================================== */
/*  SurveyBuilder page                                                */
/* ================================================================== */
export default function SurveyBuilder() {
  const navigate = useNavigate();

  /* ── state ── */
  const [activeTab, setActiveTab] = useState('questions');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [endMessage, setEndMessage] = useState('Thank you for completing this survey!');

  const [pages, setPages] = useState([
    { id: 'page-1', title: '', description: '' },
  ]);

  const [questions, setQuestions] = useState([
    defaultQuestion('radio', 1),
  ]);

  const [logicRules, setLogicRules] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [duration, setDuration] = useState('5');
  const [error, setError] = useState('');

  /* ── helpers ── */
  const questionsForPage = useCallback(
    (pageNum) => questions.filter((q) => q.page === pageNum),
    [questions],
  );

  const updateQuestion = (id, updates) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addQuestion = (type, pageNum) => {
    setQuestions((prev) => [...prev, defaultQuestion(type, pageNum)]);
  };

  const addPage = () => {
    const num = pages.length + 1;
    setPages((prev) => [...prev, { id: `page-${num}`, title: '', description: '' }]);
  };

  const updatePage = (idx, updates) => {
    setPages((prev) => prev.map((p, i) => (i === idx ? { ...p, ...updates } : p)));
  };

  const removePage = (idx) => {
    if (pages.length <= 1) return;
    const pageNum = idx + 1;
    setQuestions((prev) => prev.filter((q) => q.page !== pageNum));
    setPages((prev) => prev.filter((_, i) => i !== idx));
    setQuestions((prev) =>
      prev.map((q) => (q.page > pageNum ? { ...q, page: q.page - 1 } : q)),
    );
  };

  /* ── option helpers ── */
  const addOption = (qId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
          : q,
      ),
    );
  };

  const removeOption = (qId, optIdx) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== optIdx) } : q,
      ),
    );
  };

  const updateOption = (qId, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === optIdx ? value : o)) }
          : q,
      ),
    );
  };

  /* ── logic helpers ── */
  const addLogicRule = () => {
    setLogicRules((prev) => [
      ...prev,
      { id: `rule-${Date.now()}`, questionId: '', condition: 'equals', value: '', action: '', target: '' },
    ]);
  };

  const updateLogicRule = (id, updates) => {
    setLogicRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeLogicRule = (id) => {
    setLogicRules((prev) => prev.filter((r) => r.id !== id));
  };

  /* ── publish ── */
  const handlePublish = async () => {
    setError('');
    const finalTitle = surveyTitle.trim();
    if (!finalTitle) {
      setError('Please add a survey title');
      setShowPublishModal(false);
      setActiveTab('questions');
      return;
    }

    const validQs = questions.filter((q) => q.text.trim());
    if (validQs.length === 0) {
      setError('Add at least one question with text');
      setShowPublishModal(false);
      setActiveTab('questions');
      return;
    }

    setPublishing(true);
    try {
      await API.post('/surveys/builder', {
        title: finalTitle,
        description: surveyDescription,
        questions: validQs,
        pages,
        logicRules,
        endMessage,
        duration: Number(duration) || 5,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to publish survey');
    } finally {
      setPublishing(false);
      setShowPublishModal(false);
    }
  };

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="glass border-b border-border/30 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">SS</span>
          </div>
          <span className="text-lg font-bold text-text-dark font-[Raleway]">
            Survey<span className="text-primary">Swap</span>
          </span>
        </div>
        <button
          onClick={() => setShowPublishModal(true)}
          className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/20 text-white px-6 py-2 rounded-xl font-semibold border-none cursor-pointer transition-all"
        >
          Publish
        </button>
      </header>

      {/* ── TAB BAR ── */}
      <div className="glass border-b border-border/30 px-4 flex items-center justify-between">
        <div className="flex">
          {['questions', 'preview', 'logic'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer border-l-0 border-r-0 border-t-0 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text/50 hover:text-text-dark'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-text/30 hover:text-text/60 bg-transparent border-none cursor-pointer" title="Undo">
            <FaUndo size={14} />
          </button>
          <button className="p-2 text-text/30 hover:text-text/60 bg-transparent border-none cursor-pointer" title="Redo">
            <FaRedo size={14} />
          </button>
          {activeTab === 'questions' && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border-none cursor-pointer transition-colors ${
                showAdvanced ? 'bg-primary/15 text-primary' : 'bg-transparent text-text/50 hover:text-text-dark'
              }`}
            >
              <FaSlidersH size={14} />
              Advanced
              <FaArrowRight size={10} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="bg-red-500/10 text-red-400 border-b border-red-500/20 px-4 py-2 text-sm font-medium text-center">
          {error}
          <button onClick={() => setError('')} className="ml-3 underline bg-transparent border-none text-red-400 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ══════════ QUESTIONS TAB ══════════ */}
        {activeTab === 'questions' && (
          <>
            {/* Left sidebar — question types */}
            <aside className="w-14 bg-surface border-r border-border/30 flex flex-col items-center py-4 gap-1 flex-shrink-0">
              {QUESTION_TYPES.map((qt) => {
                const Icon = qt.icon;
                return (
                  <div key={qt.type} className="relative group">
                    <button
                      onClick={() => addQuestion(qt.type, 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-text/40 hover:bg-primary/15 hover:text-primary bg-transparent border-none cursor-pointer transition-colors"
                    >
                      <Icon size={18} />
                    </button>
                    <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-surface-light text-text-dark text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-40 border border-border/30">
                      {qt.label}
                    </span>
                  </div>
                );
              })}
            </aside>

            {/* Main editor */}
            <main className={`flex-1 overflow-y-auto p-6 transition-all ${showAdvanced ? 'mr-80' : ''}`}>
              <div className="max-w-3xl mx-auto">
                {/* Survey title & description */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="Add a survey title here"
                    className="w-full text-3xl font-semibold text-text-dark placeholder-text/20 bg-transparent border-none outline-none mb-2"
                  />
                  <input
                    type="text"
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Add a description here if you like"
                    className="w-full text-base text-text/60 placeholder-text/20 bg-transparent border-none outline-none"
                  />
                  <div className="h-0.5 bg-gradient-to-r from-primary to-accent mt-3" />
                </div>

                {/* Pages */}
                {pages.map((page, pageIdx) => {
                  const pageNum = pageIdx + 1;
                  const pageQs = questionsForPage(pageNum);
                  return (
                    <div key={page.id} className="mb-8">
                      {/* Page header */}
                      <div className="bg-primary/10 rounded-t-xl p-4 border border-b-0 border-primary/20">
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) => updatePage(pageIdx, { title: e.target.value })}
                          placeholder="You can add a page title here, but you don't have to"
                          className="w-full text-lg font-semibold text-text-dark placeholder-text/30 bg-transparent border-none outline-none mb-1"
                        />
                        <input
                          type="text"
                          value={page.description}
                          onChange={(e) => updatePage(pageIdx, { description: e.target.value })}
                          placeholder="Page description"
                          className="w-full text-sm text-text/60 placeholder-text/30 bg-transparent border-none outline-none"
                        />
                      </div>

                      {/* Questions in this page */}
                      <div className="border border-border/30 border-t-0 rounded-b-xl bg-surface">
                        {pageQs.map((q, qIdx) => (
                          <QuestionEditor
                            key={q.id}
                            question={q}
                            index={qIdx}
                            onUpdate={(u) => updateQuestion(q.id, u)}
                            onRemove={() => removeQuestion(q.id)}
                            onAddOption={() => addOption(q.id)}
                            onRemoveOption={(i) => removeOption(q.id, i)}
                            onUpdateOption={(i, v) => updateOption(q.id, i, v)}
                          />
                        ))}

                        {/* Add Question button */}
                        <div className="p-3 border-t border-border/20 flex items-center justify-between">
                          <button
                            onClick={() => addQuestion('radio', pageNum)}
                            className="text-primary text-sm font-medium bg-transparent border-none cursor-pointer hover:underline flex-1 text-center"
                          >
                            Add Question
                          </button>
                          <div className="relative group">
                            <button className="p-1.5 text-text/30 hover:text-text/60 bg-transparent border-none cursor-pointer">
                              <FaEllipsisH size={14} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 glass-light border border-border/30 rounded-lg shadow-lg py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-20 min-w-[140px]">
                              {pages.length > 1 && (
                                <button
                                  onClick={() => removePage(pageIdx)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 bg-transparent border-none cursor-pointer"
                                >
                                  Delete page
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Page button */}
                <button
                  onClick={addPage}
                  className="w-full py-3 border-2 border-dashed border-border/30 rounded-xl text-text/40 hover:border-primary hover:text-primary bg-transparent cursor-pointer transition-colors font-medium text-sm"
                >
                  + Add New Page
                </button>
              </div>
            </main>

            {/* Right panel — Advanced settings */}
            {showAdvanced && (
              <aside className="w-80 bg-surface border-l border-border/30 fixed right-0 top-[105px] bottom-0 overflow-y-auto p-5 z-20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-text/40 uppercase tracking-wider">General</span>
                  <span className="text-xs text-text/30">Survey</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text/60 mb-1">Survey title</label>
                    <input
                      type="text"
                      value={surveyTitle}
                      onChange={(e) => setSurveyTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text/60 mb-1">Survey description</label>
                    <textarea
                      value={surveyDescription}
                      onChange={(e) => setSurveyDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text/60 mb-1">End of survey message</label>
                    <input
                      type="text"
                      value={endMessage}
                      onChange={(e) => setEndMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              </aside>
            )}
          </>
        )}

        {/* ══════════ PREVIEW TAB ══════════ */}
        {activeTab === 'preview' && (
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto glass-light rounded-2xl p-8">
              <h1 className="text-2xl font-bold mb-1 text-text-dark">{surveyTitle || 'Untitled Survey'}</h1>
              {surveyDescription && <p className="text-text/60 mb-6">{surveyDescription}</p>}

              {pages.map((page, pageIdx) => {
                const pageNum = pageIdx + 1;
                const pageQs = questionsForPage(pageNum);
                return (
                  <div key={page.id} className="mb-8">
                    {page.title && <h2 className="text-lg font-semibold mb-1 text-text-dark">{page.title}</h2>}
                    {page.description && <p className="text-sm text-text/60 mb-4">{page.description}</p>}

                    <div className="space-y-6">
                      {pageQs.map((q, qIdx) => (
                        <PreviewQuestion key={q.id} question={q} index={qIdx} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {questions.filter((q) => q.text.trim()).length === 0 && (
                <p className="text-text/50 text-center py-8">No questions added yet. Go to the Questions tab to get started.</p>
              )}
            </div>
          </main>
        )}

        {/* ══════════ LOGIC TAB ══════════ */}
        {activeTab === 'logic' && (
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-end gap-3 mb-6 text-sm">
                <span className="text-text/50">All Questions</span>
                <span className="text-text/50">All Action Types</span>
              </div>

              {logicRules.length === 0 && !logicRules.length && (
                <div className="text-center py-16">
                  <p className="text-text/50 mb-6">Create a rule to customize the flow of the survey.</p>
                  <button
                    onClick={addLogicRule}
                    className="border-2 border-border/30 rounded-xl px-8 py-3 text-primary font-medium bg-transparent cursor-pointer hover:border-primary transition-colors"
                  >
                    Add New Rule
                  </button>
                </div>
              )}

              {logicRules.map((rule) => (
                <LogicRuleEditor
                  key={rule.id}
                  rule={rule}
                  questions={questions}
                  pages={pages}
                  onUpdate={(u) => updateLogicRule(rule.id, u)}
                  onRemove={() => removeLogicRule(rule.id)}
                />
              ))}

              {logicRules.length > 0 && (
                <button
                  onClick={addLogicRule}
                  className="w-full mt-4 border-2 border-dashed border-border/30 rounded-xl py-3 text-text/30 font-medium bg-transparent cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  Add New Rule
                </button>
              )}
            </div>
          </main>
        )}
      </div>

      {/* ── PUBLISH MODAL ── */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPublishModal(false)}>
          <div className="glass-light rounded-2xl shadow-xl w-full max-w-md p-6 glow-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-text-dark">Publish Survey</h2>
            <p className="text-text/60 text-sm mb-5">
              Your survey will be live and available for participants.
            </p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-text-dark mb-1.5">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min={1}
                max={60}
                className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="5"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-3 rounded-xl font-medium border border-border/30 bg-transparent text-text/60 hover:bg-text-dark/5 hover:text-text-dark transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer border-none"
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  QuestionEditor — inline question editing                          */
/* ================================================================== */
function QuestionEditor({ question, index, onUpdate, onRemove, onAddOption, onRemoveOption, onUpdateOption }) {
  const q = question;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-4 border-t border-border/20 first:border-t-0 group">
      <div className="flex items-start gap-3">
        {/* Drag handle & number */}
        <div className="flex items-center gap-1 mt-1 text-text/30">
          <FaGripVertical size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm font-medium">{index + 1}.</span>
        </div>

        {/* Question text */}
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={q.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Start writing your question here."
              className="flex-1 text-sm font-medium text-text-dark placeholder-text/30 bg-transparent border-none outline-none py-1"
            />
            {q.required && <span className="text-red-400 text-lg leading-none">*</span>}
          </div>

          {/* Type-specific editor */}
          <div className="mt-3">
            {(q.type === 'radio' || q.type === 'checkbox') && (
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    {q.type === 'radio' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-text/20 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded border-2 border-text/20 flex-shrink-0" />
                    )}
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => onUpdateOption(optIdx, e.target.value)}
                      className="flex-1 text-sm text-text/70 bg-transparent border-none outline-none py-0.5"
                    />
                    {q.options.length > 1 && (
                      <button
                        onClick={() => onRemoveOption(optIdx)}
                        className="text-text/20 hover:text-red-400 bg-transparent border-none cursor-pointer p-0.5"
                      >
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={onAddOption}
                  className="text-primary text-xs font-medium bg-transparent border-none cursor-pointer hover:underline mt-1"
                >
                  + Add option
                </button>
              </div>
            )}

            {q.type === 'rating' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate({ ratingScale: Math.max(2, (q.ratingScale || 5) - 1) })}
                  className="w-7 h-7 rounded-full border border-border/30 flex items-center justify-center text-text/40 bg-transparent cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  <FaMinus size={10} />
                </button>
                <button
                  onClick={() => onUpdate({ ratingScale: Math.min(10, (q.ratingScale || 5) + 1) })}
                  className="w-7 h-7 rounded-full border border-border/30 flex items-center justify-center text-text/40 bg-transparent cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  <FaPlus size={10} />
                </button>
                {Array.from({ length: q.ratingScale || 5 }, (_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-border/30 flex items-center justify-center text-sm text-text/50 font-medium"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {q.type === 'text' && (
              <div className="border-b border-border/30 pb-1">
                <span className="text-sm text-text/30">Respondent will type their answer here...</span>
              </div>
            )}

            {q.type === 'dropdown' && (
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <span className="text-xs text-text/30 w-5">{optIdx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => onUpdateOption(optIdx, e.target.value)}
                      className="flex-1 text-sm text-text/70 bg-transparent border-none outline-none py-0.5"
                    />
                    {q.options.length > 1 && (
                      <button
                        onClick={() => onRemoveOption(optIdx)}
                        className="text-text/20 hover:text-red-400 bg-transparent border-none cursor-pointer p-0.5"
                      >
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={onAddOption}
                  className="text-primary text-xs font-medium bg-transparent border-none cursor-pointer hover:underline mt-1"
                >
                  + Add option
                </button>
              </div>
            )}

            {q.type === 'ranking' && (
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2 bg-text-dark/5 rounded-lg px-3 py-1.5 border border-border/20">
                    <FaGripVertical size={10} className="text-text/30" />
                    <span className="text-xs text-text/30 w-5">{optIdx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => onUpdateOption(optIdx, e.target.value)}
                      className="flex-1 text-sm text-text/70 bg-transparent border-none outline-none"
                    />
                    {q.options.length > 1 && (
                      <button
                        onClick={() => onRemoveOption(optIdx)}
                        className="text-text/20 hover:text-red-400 bg-transparent border-none cursor-pointer p-0.5"
                      >
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={onAddOption}
                  className="text-primary text-xs font-medium bg-transparent border-none cursor-pointer hover:underline mt-1"
                >
                  + Add item
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="flex items-center gap-1 text-xs text-text/50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={q.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="accent-primary"
            />
            Required
          </label>

          {/* Type switcher */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-text/30 hover:text-text/60 bg-transparent border-none cursor-pointer"
            >
              <FaEllipsisH size={12} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 glass-light border border-border/30 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
                {QUESTION_TYPES.map((qt) => {
                  const Icon = qt.icon;
                  return (
                    <button
                      key={qt.type}
                      onClick={() => {
                        const newOpts = ['radio', 'checkbox', 'dropdown', 'ranking'].includes(qt.type)
                          ? q.options.length > 0 ? q.options : ['Option 1', 'Option 2', 'Option 3']
                          : [];
                        onUpdate({ type: qt.type, options: newOpts, ratingScale: qt.type === 'rating' ? 5 : undefined });
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-text-dark/5 bg-transparent border-none cursor-pointer ${
                        q.type === qt.type ? 'text-primary font-medium' : 'text-text/60'
                      }`}
                    >
                      <Icon size={14} /> {qt.label}
                    </button>
                  );
                })}
                <hr className="my-1 border-border/20" />
                <button
                  onClick={() => { onRemove(); setShowMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 bg-transparent border-none cursor-pointer"
                >
                  <FaTrash size={12} /> Delete question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PreviewQuestion — read-only question rendering                    */
/* ================================================================== */
function PreviewQuestion({ question, index }) {
  const q = question;
  if (!q.text.trim()) return null;

  return (
    <div className="pb-5 border-b border-border/20 last:border-b-0">
      <p className="text-sm font-medium text-text-dark mb-2">
        {index + 1}. {q.text}
        {q.required && <span className="text-red-400 ml-1">*</span>}
      </p>

      {(q.type === 'radio') && (
        <div className="space-y-2 ml-4">
          {q.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-text/60 cursor-pointer">
              <input type="radio" name={`preview-${q.id}`} disabled className="accent-primary" />
              {opt}
            </label>
          ))}
        </div>
      )}

      {q.type === 'checkbox' && (
        <div className="space-y-2 ml-4">
          {q.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-text/60 cursor-pointer">
              <input type="checkbox" disabled className="accent-primary" />
              {opt}
            </label>
          ))}
        </div>
      )}

      {q.type === 'rating' && (
        <div className="flex gap-2 ml-4">
          {Array.from({ length: q.ratingScale || 5 }, (_, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full border-2 border-border/30 flex items-center justify-center text-sm text-text/50 font-medium cursor-pointer hover:border-primary hover:text-primary transition-colors"
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {q.type === 'text' && (
        <div className="ml-4">
          <textarea
            disabled
            placeholder="Your answer..."
            rows={2}
            className="w-full px-3 py-2 bg-text-dark/5 border border-border/30 rounded-lg text-sm resize-none text-text/40"
          />
        </div>
      )}

      {q.type === 'dropdown' && (
        <div className="ml-4">
          <select disabled className="w-full px-3 py-2 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text/50">
            <option>Select an option...</option>
            {q.options.map((opt, i) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      {q.type === 'ranking' && (
        <div className="space-y-2 ml-4">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 bg-text-dark/5 rounded-lg px-3 py-2 text-sm text-text/60 border border-border/20">
              <FaGripVertical size={10} className="text-text/30" />
              <span className="text-text/30 mr-1">{i + 1}.</span>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  LogicRuleEditor                                                   */
/* ================================================================== */
function LogicRuleEditor({ rule, questions, pages, onUpdate, onRemove }) {
  const allQuestions = questions.filter((q) => q.text.trim());

  return (
    <div className="glass-light rounded-xl p-5 mb-4">
      <h3 className="font-semibold text-text-dark mb-4">New rule</h3>

      <div className="space-y-3">
        {/* IF */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-text/60 w-10">If</span>
          <select
            value={rule.questionId}
            onChange={(e) => onUpdate({ questionId: e.target.value })}
            className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm text-text-dark cursor-pointer"
          >
            <option value="" className="bg-surface">Select...</option>
            {allQuestions.map((q) => (
              <option key={q.id} value={q.id} className="bg-surface">{q.text}</option>
            ))}
          </select>
          <select
            value={rule.condition}
            onChange={(e) => onUpdate({ condition: e.target.value })}
            className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-sm text-text-dark cursor-pointer"
          >
            <option value="equals" className="bg-surface">Equals</option>
            <option value="not_equals" className="bg-surface">Not Equals</option>
            <option value="contains" className="bg-surface">Contains</option>
          </select>
        </div>

        {/* Value */}
        {rule.questionId && (() => {
          const q = questions.find((q) => q.id === rule.questionId);
          if (!q) return null;
          if (['radio', 'checkbox', 'dropdown'].includes(q.type)) {
            return (
              <div className="flex items-center gap-2 ml-10">
                <select
                  value={rule.value}
                  onChange={(e) => onUpdate({ value: e.target.value })}
                  className="px-3 py-1.5 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark cursor-pointer"
                >
                  <option value="" className="bg-surface">Select value...</option>
                  {q.options.map((opt, i) => (
                    <option key={i} value={opt} className="bg-surface">{opt}</option>
                  ))}
                </select>
              </div>
            );
          }
          return (
            <div className="ml-10">
              <input
                type="text"
                value={rule.value}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder="Enter value..."
                className="px-3 py-1.5 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          );
        })()}

        {/* THEN */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-text/60 w-10">then</span>
          <select
            value={rule.action}
            onChange={(e) => onUpdate({ action: e.target.value })}
            className="px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-lg text-sm text-text-dark cursor-pointer"
          >
            <option value="" className="bg-surface">Select action...</option>
            <option value="skip_to_page" className="bg-surface">Skip to page</option>
            <option value="end_survey" className="bg-surface">End survey</option>
          </select>
          {rule.action === 'skip_to_page' && (
            <select
              value={rule.target}
              onChange={(e) => onUpdate({ target: e.target.value })}
              className="px-3 py-1.5 bg-text-dark/5 border border-border/30 rounded-lg text-sm text-text-dark cursor-pointer"
            >
              <option value="" className="bg-surface">Select page...</option>
              {pages.map((p, i) => (
                <option key={p.id} value={i + 1} className="bg-surface">
                  Page {i + 1}{p.title ? `: ${p.title}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onRemove}
          className="text-red-400 text-sm hover:underline bg-transparent border-none cursor-pointer"
        >
          Delete
        </button>
        <span className="text-primary text-sm font-medium cursor-pointer">Done</span>
      </div>
    </div>
  );
}
