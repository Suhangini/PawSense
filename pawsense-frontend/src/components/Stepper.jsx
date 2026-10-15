function Stepper({ currentStep }) {
    const steps = [
        { id: 1, title: "Pet Profile" },
        { id: 2, title: "Health Info" },
        { id: 3, title: "Complete" },
    ];

    return (
        <div className="stepper">

            {steps.map((step, index) => (
                <div className="step-item" key={step.id}>

                    <div className="step-top">

                        <div
                            className={`step-circle ${
                                currentStep >= step.id ? "active" : ""
                            }`}
                        >
                            {currentStep > step.id ? "✓" : step.id}
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={`step-line ${
                                    currentStep > step.id ? "active" : ""
                                }`}
                            />
                        )}

                    </div>

                    <div
                        className={`step-title ${
                            currentStep === step.id ? "active" : ""
                        }`}
                    >
                        {step.title}
                    </div>

                </div>
            ))}

        </div>
    );
}

export default Stepper;