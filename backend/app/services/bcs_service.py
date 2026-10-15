# ============================================================
# PawSense — Rule-Based Estimated BCS
# ============================================================

# Reference healthy adult weight ranges.
# These are project reference values, not veterinary diagnosis.

BREED_WEIGHT_RANGES = {

    # DOGS
    "labrador": {
        "male": (29, 36),
        "female": (25, 32)
    },

    "golden retriever": {
        "male": (30, 34),
        "female": (25, 32)
    },

    "german shepherd": {
        "male": (30, 40),
        "female": (22, 32)
    },

    "beagle": {
        "male": (10, 11),
        "female": (9, 10)
    },

    "pug": {
        "male": (6, 9),
        "female": (6, 9)
    },

    "shih tzu": {
        "male": (4, 7),
        "female": (4, 7)
    },

        # INDIAN DOMESTIC DOG (INDIE)
    "indian domestic dog": {
        "male": (15, 25),
        "female": (12, 22)
    },

    "indian-domestic-dog": {
        "male": (15, 25),
        "female": (12, 22)
    },

    "indian pariah": {
        "male": (15, 25),
        "female": (12, 22)
    },

    # CATS
    "persian": {
        "male": (4, 6),
        "female": (3, 5)
    },
    "indian domestic cat": {
        "male": (3.5, 5.5),
        "female": (3, 5)
    },

    "indian-domestic-cat": {
        "male": (3.5, 5.5),
        "female": (3, 5)
    },

    "indian domestic": {
        "male": (3.5, 5.5),
        "female": (3, 5)
    },

    "siamese": {
        "male": (4, 6),
        "female": (3, 5)
    },

    "maine coon": {
        "male": (6, 10),
        "female": (4, 7)
    },

    "bengal cat": {
    "male": (4.5, 7),
    "female": (3.5, 5.5)
},

    "ragdoll cat": {
        "male": (6.8, 9.1),
        "female": (4.5, 6.8)
    },

    "indian domestic": {
        "male": (3.5, 5.5),
        "female": (3, 5)
    }
}


# ============================================================
# NORMALIZE TEXT
# ============================================================

def normalize_text(value):

    if not value:
        return ""

    return value.strip().lower()


# ============================================================
# AGE ADJUSTMENT
# ============================================================

def get_age_factor(age, species, breed):
    """
    Project-level age adjustment.

    Adult breed weight ranges are used as the base reference.
    Younger pets receive a conservative reduction because they
    may not have reached their mature body size yet.

    This is an estimation for PawSense and is NOT a veterinary
    growth chart.
    """

    age = float(age)
    species = normalize_text(species)
    breed = normalize_text(breed)

    # Adult / mature reference
    if age >= 4:
        return 1.0

    # 3–4 years
    if age >= 3:
        return 0.95

    # 2–3 years
    if age >= 2:
        return 0.90

    # 1–2 years
    if age >= 1:
        return 0.85

    # Below 1 year
    return 0.70


# ============================================================
# GET IDEAL WEIGHT
# ============================================================

def get_ideal_weight(data):

    breed = normalize_text(data.breed)
    gender = normalize_text(data.gender)

    breed_data = BREED_WEIGHT_RANGES.get(breed)

    if breed_data:

        # Try gender-specific range
        if gender in breed_data:

            minimum, maximum = breed_data[gender]

            # Adult midpoint
            adult_ideal_weight = (
                minimum + maximum
            ) / 2

            # Apply age adjustment
            age_factor = get_age_factor(
                data.age,
                data.species,
                data.breed
            )

            adjusted_ideal_weight = (
                adult_ideal_weight * age_factor
            )

            return (
                round(adjusted_ideal_weight, 2),
                "breed_reference_age_adjusted"
            )

        # If gender isn't available
        ranges = list(breed_data.values())

        minimum = min(
            item[0] for item in ranges
        )

        maximum = max(
            item[1] for item in ranges
        )

        adult_ideal_weight = (
            minimum + maximum
        ) / 2

        age_factor = get_age_factor(
            data.age,
            data.species,
            data.breed
        )

        adjusted_ideal_weight = (
            adult_ideal_weight * age_factor
        )

        return (
            round(adjusted_ideal_weight, 2),
            "breed_reference_age_adjusted"
        )

    return None, "unknown"


# ============================================================
# CALCULATE BCS
# ============================================================

def calculate_bcs(data):

    current_weight = float(data.weight)

    ideal_weight, weight_source = get_ideal_weight(data)

    # --------------------------------------------------------
    # No reference weight available
    # --------------------------------------------------------

    if ideal_weight is None:

        return {
            "bcs_score": None,
            "status": "Ideal weight required",
            "weight": current_weight,
            "height": data.height,
            "ideal_weight": None,
            "weight_difference_percent": None,
            "weight_source": "unknown",
            "recommendation": [
                "Add a recognized breed or ideal weight.",
                "A veterinarian can help determine the ideal weight.",
                "BCS should be confirmed using physical assessment."
            ],
            "diet_message": (
                "An ideal weight is needed before PawSense "
                "can estimate the body condition score."
            )
        }

    # --------------------------------------------------------
    # Calculate percentage difference
    # --------------------------------------------------------

    weight_difference_percent = (
        (current_weight - ideal_weight)
        / ideal_weight
    ) * 100

    # --------------------------------------------------------
    # Estimate BCS
    # --------------------------------------------------------

    if weight_difference_percent <= -30:

        bcs_score = 2
        status = "Underweight"

    elif weight_difference_percent <= -15:

        bcs_score = 3
        status = "Underweight"

    elif weight_difference_percent <= 5:

        bcs_score = 5
        status = "Ideal"

    elif weight_difference_percent <= 15:

        bcs_score = 6
        status = "Overweight"

    elif weight_difference_percent <= 25:

        bcs_score = 7
        status = "Overweight"

    elif weight_difference_percent <= 35:

        bcs_score = 8
        status = "Obese"

    else:

        bcs_score = 9
        status = "Severely Obese"

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    if bcs_score <= 3:

        recommendation = [
            "Gradually increase nutritional intake.",
            "Provide a balanced, nutrient-dense diet.",
            "Monitor weight regularly.",
            "Consult a veterinarian if weight remains low."
        ]

        diet_message = (
            "The pet may need increased nutritional intake "
            "and should be monitored regularly."
        )

    elif bcs_score in [4, 5]:

        recommendation = [
            "Maintain the current feeding routine.",
            "Continue regular physical activity.",
            "Keep treats within appropriate limits.",
            "Monitor weight regularly."
        ]

        diet_message = (
            "The pet is within the estimated healthy weight range. "
            "Maintain a balanced diet and regular activity."
        )

    elif bcs_score in [6, 7]:

        recommendation = [
            "Measure daily food portions.",
            "Reduce unnecessary high-calorie treats.",
            "Increase regular physical activity.",
            "Monitor weight regularly.",
            "Consult a veterinarian for a personalized plan."
        ]

        diet_message = (
            "The pet may benefit from controlled calorie intake "
            "and increased physical activity."
        )

    else:

        recommendation = [
            "Measure and control daily food portions.",
            "Reduce high-calorie treats.",
            "Increase appropriate physical activity.",
            "Monitor weight regularly.",
            "Consult a veterinarian for a personalized weight-management plan."
        ]

        diet_message = (
            "The pet may require a structured weight-management "
            "plan under veterinary guidance."
        )

    # --------------------------------------------------------
    # Final Response
    # --------------------------------------------------------

    return {
        "bcs_score": bcs_score,
        "status": status,
        "weight": current_weight,
        "height": data.height,
        "ideal_weight": ideal_weight,
        "weight_difference_percent": round(
            weight_difference_percent,
            1
        ),
        "weight_source": weight_source,
        "recommendation": recommendation,
        "diet_message": diet_message
    }