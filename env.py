import google.generativeai as genai
import os
from dotenv import load_dotenv


def setup_environment():
    load_dotenv()
    api_key = os.getenv("JINJA2_TEMPLATE_PATH")

    if not api_key:
        raise ValueError("JINJA2_TEMPLATE_PATH is not set. Please add it to your environment variables.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    return model


def last_page(question: str) -> str:
    model = setup_environment()  # Get the model instance
    response = model.generate_content(question + "generate .fhir records JUST SEND RECORDS NO SURROUNDING text")  # Direct API call for a normal response
    return response.text  # Return Gemini's response as a plain string


def next_page(first, second: str) -> str:
    model = setup_environment()  # Get the model instance
    response = model.generate_content("My current medications are " + first + "I am allergic to" + second + "Just return a boolean as True or False if there could be an issue if I consume this.")
    if(response.text == 'False'):
        return "The current medications might trigger allergic reactions. Please consult a physician before consuming."
    else:
        return "The current medications seem to be  safe to consume without any potential allergic reactions."


def jinja2templates(family_history: list) -> str:
    model = setup_environment()
    if family_history:
        history_prompt = "My family has a history of the following diseases: " + ", ".join(family_history) + ". Based on this, what are the probable diseases I might be at risk for? Just return a comma-separated list of major probable diseases. Don't include results for statements or phrases which are not diseases."
        disease_response = model.generate_content(history_prompt)
        probable_diseases = disease_response.text
    else:
        probable_diseases = "No significant hereditary disease risk identified."

    return "Probable Diseases based on Family History: " + probable_diseases


def jinja(current_medications: str, prescribed_medications: str) -> str:
    model = setup_environment()  # Get the model instance

    # Check for medication interactions
    interaction_prompt = (
        "My current medications are " + current_medications +
        " and my prescribed medications are " + prescribed_medications +
        ". Just return a boolean as True or False if there could be an interaction between them."
    )

    response = model.generate_content(interaction_prompt)

    if response.text == 'True':
        interaction_warning = "There might be a potential interaction between your current and prescribed medications. Please consult a physician before taking them together."
    else:
        interaction_warning = "No significant interaction detected between your current and prescribed medications."

    return interaction_warning
