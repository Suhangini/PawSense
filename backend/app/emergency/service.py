from .knowledge_base import EMERGENCY_KNOWLEDGE_BASE
from .gemini_service import classify_emergency
from .question_logic import (
    get_next_question,
    get_next_field
)


# ============================================================
# KEYWORD FALLBACK CLASSIFIER
# ============================================================

def keyword_fallback(message: str):
    """
    Controlled fallback classifier used when Groq is unavailable.

    More specific phrases are preferred so overlapping words
    do not incorrectly classify an emergency.
    """

    text = message.lower().strip()

    priority_categories = [
        "breathing_problem",
        "poisoning",
        "eye_issue",
        "heat_cycle",
        "limping_injury",
        "paw_injury",
        "allergic_reaction",
        "bleeding"
    ]

    matches = []

    for category in priority_categories:

        data = EMERGENCY_KNOWLEDGE_BASE.get(category)

        if not data:
            continue

        for keyword in data["keywords"]:

            keyword = keyword.lower().strip()

            if keyword in text:

                matches.append(
                    (
                        category,
                        data,
                        keyword,
                        len(keyword)
                    )
                )

    if not matches:
        return None, None, []

    # =========================================================
    # PAW + CUT/WOUND SPECIAL CASE
    # =========================================================

    paw_terms = [
        "paw",
        "paws"
    ]

    bleeding_terms = [
        "bleeding",
        "bleed",
        "blood",
        "bleeding heavily",
        "heavy bleeding",
        "persistent bleeding",
        "blood coming out",
        "blood loss"
    ]

    has_paw = any(
        term in text
        for term in paw_terms
    )

    has_explicit_bleeding = any(
        term in text
        for term in bleeding_terms
    )

    if has_paw and not has_explicit_bleeding:

        paw_data = EMERGENCY_KNOWLEDGE_BASE.get(
            "paw_injury"
        )

        if paw_data:

            paw_matches = [
                keyword
                for keyword in paw_data["keywords"]
                if keyword.lower() in text
            ]

            if paw_matches:

                best_keyword = max(
                    paw_matches,
                    key=len
                )

                return (
                    "paw_injury",
                    paw_data,
                    [best_keyword]
                )

    # =========================================================
    # BEST MATCH
    # =========================================================

    best_match = max(
        matches,
        key=lambda item: item[3]
    )

    category, data, keyword, _ = best_match

    return (
        category,
        data,
        [keyword]
    )


# ============================================================
# SAFE CLASSIFICATION
# ============================================================

async def safe_classify_emergency(
    message: str,
    conversation_context: str = ""
):
    """
    Try Groq first.

    If Groq is unavailable, use the controlled keyword
    fallback classifier.
    """

    try:

        result = await classify_emergency(
            message,
            conversation_context
        )

        return result

    except Exception as e:

        print(
            f"Groq unavailable. "
            f"Using fallback classifier: {e}"
        )

        category, data, symptoms = keyword_fallback(
            message
        )

        from .schemas import GeminiEmergencyClassification

        return GeminiEmergencyClassification(
            category=category or "unknown",
            symptoms=symptoms,
            duration=None,
            weight_bearing="unknown",
            trauma="unknown",
            severe_pain="unknown",
            affected_area=None,
            urgency="unknown"
        )


# ============================================================
# LOCAL ANSWER EXTRACTION
# ============================================================

def apply_local_answer(state, message: str):
    """
    Extract simple information locally from the user's message.

    This supplements Groq and handles short conversational
    answers such as:

        yes
        no
        about 2 hours
        no, he cannot put weight on it
        one tablet
        paracetamol
    """

    text = message.lower().strip()

    # =========================================================
    # WEIGHT BEARING
    # =========================================================

    if state.weight_bearing == "unknown":

        negative_weight_terms = [
            "not putting weight",
            "not putting the weight",
            "not able to put weight",
            "not able to put the weight",
            "not bearing weight",
            "can't put weight",
            "can't put the weight",
            "cannot put weight",
            "cannot put the weight",
            "can't bear weight",
            "can't bear the weight",
            "cannot bear weight",
            "cannot bear the weight",
            "won't put weight",
            "won't put the weight",
            "won't bear weight",
            "won't bear the weight",
            "unable to put weight",
            "unable to put the weight",
            "unable to bear weight",
            "not able to bear weight",
            "not using the leg",
            "not using the limb",
            "not using that leg"
        ]

        positive_weight_terms = [
            "putting weight",
            "bearing weight",
            "can put weight",
            "can bear weight",
            "able to put weight",
            "able to bear weight",
            "walking normally",
            "yes, he can",
            "yes he can",
            "yes, she can",
            "yes she can"
        ]

        if any(
            term in text
            for term in negative_weight_terms
        ):

            state.weight_bearing = "no"

        elif any(
            term in text
            for term in positive_weight_terms
        ):

            state.weight_bearing = "yes"

        elif text in [
            "no",
            "nope",
            "nah",
            "he can't",
            "she can't",
            "he cannot",
            "she cannot"
        ]:

            state.weight_bearing = "no"

        elif text in [
            "yes",
            "yeah",
            "yep"
        ]:

            state.weight_bearing = "yes"


    # =========================================================
    # DURATION
    # =========================================================

    if state.duration is None:

        duration_patterns = [
            "minute",
            "minutes",
            "hour",
            "hours",
            "day",
            "days",
            "week",
            "weeks",
            "month",
            "months",
            "yesterday",
            "today",
            "tomorrow",
            "since morning",
            "since afternoon",
            "since evening",
            "since last night",
            "since yesterday",
            "for a while",
            "for some time",
            "recently"
        ]

        if any(
            term in text
            for term in duration_patterns
        ):

            state.duration = message.strip()


    # =========================================================
    # TRAUMA
    # =========================================================

    if state.trauma == "unknown":

        negative_trauma_terms = [
            "no accident",
            "no injury",
            "no trauma",
            "didn't fall",
            "did not fall",
            "didn't have an accident",
            "did not have an accident",
            "nothing happened",
            "no, nothing"
        ]

        explicit_trauma_terms = [
            "accident",
            "had an accident",
            "got into an accident",
            "fell",
            "fall",
            "fell down",
            "fell from",
            "hit by",
            "was hit",
            "collision",
            "crash",
            "crashed",
            "trauma",
            "was dropped",
            "got hit",
            "got hurt in an accident"
        ]

        if any(
            term in text
            for term in negative_trauma_terms
        ):

            state.trauma = "no"

        elif any(
            term in text
            for term in explicit_trauma_terms
        ):

            state.trauma = "yes"

        elif text in [
            "no",
            "nope",
            "nah"
        ]:

            state.trauma = "no"

        elif text in [
            "yes",
            "yeah",
            "yep"
        ]:

            state.trauma = "yes"


    # =========================================================
    # SEVERE PAIN
    # =========================================================

    if state.severe_pain == "unknown":

        negative_pain_terms = [
            "no pain",
            "not in pain",
            "doesn't seem to be in pain",
            "does not seem to be in pain",
            "not painful",
            "not much pain",
            "little pain",
            "mild pain",
            "comfortable",
            "seems fine",
            "not hurting"
        ]

        positive_pain_terms = [
            "severe pain",
            "extreme pain",
            "very painful",
            "a lot of pain",
            "in a lot of pain",
            "crying in pain",
            "yelping in pain",
            "screaming in pain",
            "unbearable pain",
            "extreme discomfort"
        ]

        if any(
            term in text
            for term in negative_pain_terms
        ):

            state.severe_pain = "no"

        elif any(
            term in text
            for term in positive_pain_terms
        ):

            state.severe_pain = "yes"

        elif text in [
            "no",
            "nope",
            "nah"
        ]:

            state.severe_pain = "no"

        elif text in [
            "yes",
            "yeah",
            "yep"
        ]:

            state.severe_pain = "yes"


    # =========================================================
    # AFFECTED AREA
    # =========================================================

    if state.affected_area is None:

        area_terms = [
            "left back leg",
            "right back leg",
            "left front leg",
            "right front leg",
            "left back foot",
            "right back foot",
            "left front foot",
            "right front foot",
            "left leg",
            "right leg",
            "front leg",
            "back leg",
            "left paw",
            "right paw",
            "front paw",
            "back paw",
            "left foot",
            "right foot",
            "eye",
            "eyes",
            "paw",
            "paws",
            "leg",
            "legs",
            "ear",
            "ears",
            "nose",
            "mouth"
        ]

        found_area = None

        for area in area_terms:

            if area in text:

                found_area = area
                break

        if found_area:

            state.affected_area = found_area


        # =========================================================
    # POISONING - SUBSTANCE
    # =========================================================

    if state.substance is None:

        substance_patterns = [
            "paracetamol",
            "acetaminophen",
            "ibuprofen",
            "aspirin",
            "medicine",
            "medication",
            "tablet",
            "tablets",
            "pill",
            "pills",
            "capsule",
            "capsules",
            "rat poison",
            "poison",
            "insecticide",
            "pesticide",
            "chemical",
            "cleaner",
            "detergent",
            "chocolate",
            "toxic food"
        ]

        found_substance = None

        for substance in substance_patterns:

            if substance in text:

                found_substance = substance
                break

        # Only store a substance when the user actually
        # names/describes the substance.
        if found_substance:

            # Do NOT treat generic words like "medicine"
            # as the exact substance if the user needs to
            # provide the specific name.
            generic_substances = [
                "medicine",
                "medication",
                "tablet",
                "tablets",
                "pill",
                "pills",
                "capsule",
                "capsules"
            ]

            if found_substance not in generic_substances:

                state.substance = found_substance


    # =========================================================
    # POISONING - AMOUNT
    # =========================================================

    if state.amount is None:

        amount_patterns = [
            "one tablet",
            "two tablets",
            "three tablets",
            "four tablets",
            "five tablets",

            "one pill",
            "two pills",
            "three pills",
            "four pills",
            "five pills",

            "one capsule",
            "two capsules",
            "three capsules",
            "four capsules",
            "five capsules",

            "one spoon",
            "two spoons",
            "three spoons",

            "a tablet",
            "a pill",
            "a capsule",

            "a small amount",
            "a large amount",
            "a little",
            "a lot",

            "half a tablet",
            "half tablet",
            "half a pill",
            "half pill"
        ]

        found_amount = None

        for amount in amount_patterns:

            if amount in text:

                found_amount = amount
                break

        # IMPORTANT:
        # "some" by itself is NOT treated as an amount.
        # Example:
        # "Bruno swallowed some medicine"
        # should NOT set amount = "some".

        if found_amount:

            state.amount = found_amount



    return state


# ============================================================
# SEVERITY DETERMINATION
# ============================================================

def determine_severity(
    category: str,
    symptoms: list[str],
    message: str,
    duration: str | None = None,
    weight_bearing: str = "unknown",
    trauma: str = "unknown",
    severe_pain: str = "unknown"
):
    """
    Determine urgency using controlled PawSense rules.

    Groq extracts information.
    This function determines final severity.
    """

    text = (
        " ".join(symptoms).lower()
        + " "
        + message.lower()
    )

    # =========================================================
    # CRITICAL
    # =========================================================

    critical_terms = [
        "can't breathe",
        "cannot breathe",
        "difficulty breathing",
        "difficulty in breathing",
        "breathing problem",
        "open mouth breathing",
        "choking",
        "poisoning",
        "swallowed poison",
        "swallowed medicine",
        "swallowed some medicine",
        "swallowed medication",
        "ingested poison",
        "ingested medicine",
        "ingested medication",
        "chemical",
        "collapse",
        "unconscious",
        "severe bleeding",
        "obvious fracture",
        "broken bone"
    ]

    for term in critical_terms:

        if term in text:

            return (
                "critical",
                f"Critical warning sign detected: {term}."
            )


    # =========================================================
    # LIMPING / INJURY
    # =========================================================

    if category == "limping_injury":

        if weight_bearing == "no":

            return (
                "high",
                "Your pet is unable to put weight on the affected limb."
            )

        if (
            trauma == "yes"
            and severe_pain == "yes"
        ):

            return (
                "high",
                "Limping is associated with trauma and severe pain."
            )

        high_terms = [
            "visible deformity",
            "severe swelling",
            "major trauma",
            "cannot use the limb",
            "can't use the limb",
            "dragging the leg"
        ]

        for term in high_terms:

            if term in text:

                return (
                    "high",
                    f"High-risk sign detected: {term}."
                )

        if duration:

            duration_text = duration.lower()

            persistent_terms = [
                "2 day",
                "2 days",
                "three day",
                "3 day",
                "3 days",
                "four day",
                "4 day",
                "4 days",
                "5 day",
                "5 days",
                "week",
                "weeks",
                "several days"
            ]

            for term in persistent_terms:

                if term in duration_text:

                    return (
                        "high",
                        "The limping has persisted for several days."
                    )

        mild_terms = [
            "slightly limping",
            "slight limp",
            "mild limp",
            "mildly limping",
            "slightly lame"
        ]

        for term in mild_terms:

            if term in text:

                return (
                    "low",
                    "The limping appears mild based on the information provided."
                )

        return (
            "medium",
            "Moderate concern because your pet is experiencing limping."
        )


    # =========================================================
    # ALLERGIC REACTION
    # =========================================================

    if category == "allergic_reaction":

        if severe_pain == "yes":

            return (
                "high",
                "High-risk symptom detected: severe pain."
            )

        return (
            "high",
            "High-risk allergic reaction symptoms require veterinary assessment."
        )


    # =========================================================
    # PAW INJURY
    # =========================================================

    if category == "paw_injury":

        paw_high_terms = [
            "heavy bleeding",
            "deep wound",
            "severe swelling",
            "unable to use the paw",
            "embedded object",
            "something stuck in paw"
        ]

        for term in paw_high_terms:

            if term in text:

                return (
                    "high",
                    f"High-risk paw injury sign detected: {term}."
                )

        return (
            "medium",
            "Moderate concern because your pet has a paw injury."
        )


    # =========================================================
    # EYE ISSUE
    # =========================================================

    if category == "eye_issue":

        eye_high_terms = [
            "eye injury",
            "severe trauma",
            "protruding eye",
            "sudden vision problem",
            "sudden vision problems",
            "embedded foreign object"
        ]

        for term in eye_high_terms:

            if term in text:

                return (
                    "high",
                    f"High-risk eye symptom detected: {term}."
                )

        return (
            "high",
            "Eye symptoms warrant veterinary assessment."
        )


    # =========================================================
    # BLEEDING
    # =========================================================

    if category == "bleeding":

        heavy_bleeding_terms = [
            "heavy bleeding",
            "bleeding heavily",
            "persistent bleeding",
            "severe bleeding",
            "blood loss"
        ]

        for term in heavy_bleeding_terms:

            if term in text:

                return (
                    "high",
                    f"High-risk bleeding symptom detected: {term}."
                )

        return (
            "high",
            "Bleeding requires veterinary assessment."
        )


    # =========================================================
    # BREATHING
    # =========================================================

    if category == "breathing_problem":

        return (
            "critical",
            "Breathing problems require immediate veterinary attention."
        )


    # =========================================================
    # POISONING
    # =========================================================

    if category == "poisoning":

        return (
            "critical",
            "Potential poisoning requires immediate veterinary attention."
        )


    # =========================================================
    # HEAT CYCLE
    # =========================================================

    if category == "heat_cycle":

        return (
            "normal_or_concerning",
            "Severity assigned using the heat-cycle category."
        )


    # =========================================================
    # DEFAULT
    # =========================================================

    category_defaults = {
        "bleeding": "high",
        "breathing_problem": "critical",
        "poisoning": "critical",
        "allergic_reaction": "high",
        "paw_injury": "medium",
        "limping_injury": "medium",
        "eye_issue": "high",
        "heat_cycle": "normal_or_concerning"
    }

    severity = category_defaults.get(
        category,
        "unknown"
    )

    return (
        severity,
        "Severity assigned using the emergency category."
    )


# ============================================================
# SINGLE-MESSAGE EMERGENCY DETECTION
# ============================================================

async def detect_emergency(message: str):

    try:

        result = await classify_emergency(
            message
        )

        category = result.category

        if category == "unknown":

            return (
                None,
                None,
                result.symptoms,
                "unknown",
                "Unable to determine severity."
            )

        data = EMERGENCY_KNOWLEDGE_BASE.get(
            category
        )

        if not data:

            return (
                None,
                None,
                result.symptoms,
                "unknown",
                "No matching emergency category found."
            )

        severity, severity_reason = determine_severity(
            category,
            result.symptoms,
            message,
            result.duration,
            result.weight_bearing,
            result.trauma,
            result.severe_pain
        )

        return (
            category,
            data,
            result.symptoms,
            severity,
            severity_reason
        )

    except Exception as e:

        print(
            f"Groq unavailable. "
            f"Using fallback classifier: {e}"
        )

        category, data, symptoms = keyword_fallback(
            message
        )

        if not data:

            return (
                None,
                None,
                [],
                "unknown",
                "Unable to determine severity."
            )

        severity, severity_reason = determine_severity(
            category,
            symptoms,
            message
        )

        return (
            category,
            data,
            symptoms,
            severity,
            severity_reason
        )


# ============================================================
# UPDATE CONVERSATION STATE
# ============================================================

def update_conversation_state(
    state,
    result,
    message: str = ""
):
    """
    Update conversation state using Groq extraction
    and local extraction.
    """

    # ---------------------------------------------------------
    # CATEGORY
    # ---------------------------------------------------------

    if result.category != "unknown":

        state.category = result.category


    # ---------------------------------------------------------
    # SYMPTOMS
    # ---------------------------------------------------------

    for symptom in result.symptoms:

        if symptom not in state.symptoms:

            state.symptoms.append(symptom)


    # ---------------------------------------------------------
    # DURATION
    # ---------------------------------------------------------

    if result.duration:

        state.duration = result.duration


    # ---------------------------------------------------------
    # WEIGHT BEARING
    # ---------------------------------------------------------

    if result.weight_bearing != "unknown":

        state.weight_bearing = result.weight_bearing


    # ---------------------------------------------------------
    # TRAUMA
    # ---------------------------------------------------------

    if result.trauma == "no":

        state.trauma = "no"

    elif result.trauma == "yes":

        explicit_trauma_terms = [
            "accident",
            "fell",
            "fall",
            "fell down",
            "fell from",
            "hit by",
            "was hit",
            "collision",
            "crash",
            "crashed",
            "trauma",
            "was dropped",
            "got hit",
            "got hurt in an accident"
        ]

        message_text = message.lower()

        if any(
            term in message_text
            for term in explicit_trauma_terms
        ):

            state.trauma = "yes"


    # ---------------------------------------------------------
    # SEVERE PAIN
    # ---------------------------------------------------------

    if result.severe_pain != "unknown":

        state.severe_pain = result.severe_pain


    # ---------------------------------------------------------
    # AFFECTED AREA
    # ---------------------------------------------------------

    if result.affected_area:

        state.affected_area = result.affected_area


    # ---------------------------------------------------------
    # LOCAL EXTRACTION
    # ---------------------------------------------------------

    if message:

        state = apply_local_answer(
            state,
            message
        )


    return state


# ============================================================
# NEXT EMERGENCY QUESTION
# ============================================================

def get_emergency_question(state):
    """
    Determine whether PawSense needs more information.
    """

    if not state.category:

        return (
            "Please describe what is happening with your pet."
        )

    return get_next_question(
        state.category,
        state
    )