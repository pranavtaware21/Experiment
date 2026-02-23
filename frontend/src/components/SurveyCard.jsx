import { FaClock, FaBolt, FaUser, FaExternalLinkAlt, FaCheckCircle, FaChartBar } from 'react-icons/fa';
import { TiltCard, motion } from './animations';

export default function SurveyCard({ survey, onComplete, currentUser, completing }) {
  const isOwner = currentUser && (survey.owner?.id === currentUser.id || survey.owner?._id === currentUser._id || survey.ownerId === currentUser.id);
  const alreadyCompleted = currentUser && survey.completedBy?.includes(currentUser._id);
  const surveyId = survey._id || survey.id;

  // SurveySwap logic: 1 karma per minute of survey duration
  const karmaReward = survey.duration;

  const durationColor =
    survey.duration <= 3
      ? 'text-green-400 bg-green-500/10 border-green-500/20'
      : survey.duration <= 10
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-red-400 bg-red-500/10 border-red-500/20';

  return (
    <TiltCard tiltAmount={4} className="h-full">
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(124,92,252,0.15)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-light rounded-2xl hover:border-primary/30 transition-all flex flex-col overflow-hidden glow-sm h-full"
      >
        {/* Reward banner */}
        {!isOwner && !alreadyCompleted && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/5 px-5 py-2 flex items-center justify-between border-b border-border/30 animate-shimmer">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <FaBolt size={12} /> Earn {karmaReward} {karmaReward === 1 ? 'credit' : 'credits'}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${durationColor}`}>
              {survey.duration} min
            </span>
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base font-semibold text-text-dark line-clamp-1 mb-1.5">{survey.title}</h3>
          <p className="text-text/70 text-sm mb-4 line-clamp-2 flex-1">{survey.description}</p>

          <div className="flex items-center gap-3 text-xs text-text/50 mb-4">
            <span className="flex items-center gap-1">
              <FaClock size={11} /> {survey.duration} min
            </span>
            {survey.owner && (
              <span className="flex items-center gap-1">
                <FaUser size={11} /> {survey.owner.name}
              </span>
            )}
            {isOwner && (
              <span className="flex items-center gap-1 text-primary">
                <FaChartBar size={11} /> {survey.responses} responses
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <span className="text-xs text-text/50 bg-text-dark/5 px-3 py-1.5 rounded-full">Your survey</span>
            ) : alreadyCompleted ? (
              <span className="flex items-center gap-1.5 text-sm text-green-400 font-medium">
                <FaCheckCircle size={13} /> Completed
              </span>
            ) : (
              <>
                {survey.isBuiltIn ? (
                  <motion.a
                    href={`/survey/${surveyId}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-primary-dark text-white py-2.5 rounded-xl text-sm font-medium no-underline"
                  >
                    Start Survey
                  </motion.a>
                ) : (
                  <motion.a
                    href={survey.surveyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-primary-dark text-white py-2.5 rounded-xl text-sm font-medium no-underline"
                  >
                    Take Survey <FaExternalLinkAlt size={10} />
                  </motion.a>
                )}
                {currentUser && (
                  <motion.button
                    onClick={() => onComplete(surveyId)}
                    disabled={completing === surveyId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="flex items-center justify-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {completing === surveyId ? '...' : <><FaCheckCircle size={11} /> Done</>}
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </TiltCard>
  );
}
