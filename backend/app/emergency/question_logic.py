REQUIRED_INFORMATION = {

    "limping_injury": [
        "weight_bearing",
        "duration",
        "trauma",
        "severe_pain"
    ],

    "paw_injury": [
        "duration",
        "trauma",
        "severe_pain"
    ],

    "bleeding": [
        "duration",
        "trauma",
        "affected_area"
    ],

    "breathing_problem": [
        "duration",
        "severe_pain"
    ],

    # ---------------------------------------------------------
    # POISONING
    # ---------------------------------------------------------
    # For poisoning, we need to know:
    # 1. What was swallowed/exposed to?
    # 2. How long ago?
    # 3. Approximately how much?
    #
    # These are more useful than "affected_area".
    # ---------------------------------------------------------

    "poisoning": [
        "substance",
        "duration",
        "amount"
    ],

    "allergic_reaction": [
        "duration",
        "severe_pain"
    ],

    "eye_issue": [
        "duration",
        "trauma",
        "severe_pain"
    ],

    "heat_cycle": [
        "duration"
    ]
}


QUESTION_MAP = {

    "weight_bearing":
        "Is your pet able to put weight on the affected leg?",

    "duration":
        "How long has this been happening?",

    "trauma":
        "Has your pet had a fall, accident, or other injury?",

    "severe_pain":
        "Does your pet seem to be in severe pain?",

    "affected_area":
        "Where exactly is the affected area?",

    "substance":
        "What medicine, food, chemical, or other substance did your pet swallow or come into contact with?",

    "amount":
        "Do you know approximately how much your pet was exposed to or swallowed?"
}


def get_next_question(category: str, state):
    """
    Find the next important piece of information
    that is still missing.
    """

    required_fields = REQUIRED_INFORMATION.get(
        category,
        []
    )

    for field in required_fields:

        value = getattr(state, field, None)

        if value is None or value == "unknown" or value == "":

            return QUESTION_MAP[field]

    return None


def get_next_field(category: str, state):
    """
    Return the name of the next required field
    that is still missing.
    """

    required_fields = REQUIRED_INFORMATION.get(
        category,
        []
    )

    for field in required_fields:

        value = getattr(state, field, None)

        if value is None or value == "unknown" or value == "":

            return field

    return None