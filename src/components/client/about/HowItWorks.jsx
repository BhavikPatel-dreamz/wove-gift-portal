

const HowItWorks = ({ 
  title = "How It Works",
  steps = [] 
}) => {
  const defaultSteps = [
    {
      number: "1",
      title: "Choose a Brand",
      description: "Pick by category or see brand previews.",
      color: "orange"
    },
    {
      number: "2", 
      title: "Personalize",
      description: "Add a note and optional video message.",
      color: "pink"
    },
    {
      number: "3",
      title: "Send & Smile", 
      description: "Instant delivery, easy redemption in seconds.",
      color: "red"
    }
  ];

  const stepsToRender = steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
          {title}
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {stepsToRender.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`w-20 h-20 bg-gradient-to-br from-${step.color}-400 to-${step.color}-500 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <span className="text-2xl font-bold text-white">{step.number}</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;