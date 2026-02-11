

const ProcessStep = ({ icon: Icon, title, description, number }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-wave-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-wave-green mb-2">{title}</h3>
    <p className="text-wave-green text-sm">{description}</p>
  </div>
);

export default ProcessStep;