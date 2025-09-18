import ProcessStep from "./ProcessStep";

const ProcessSection = ({ title, subtitle, steps }) => (
  <section className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-pink-500 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <ProcessStep {...step} number={index + 1} />
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-10"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;