from fastapi_mail import FastMail, MessageSchema
from fastapi import BackgroundTasks
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from .config import conf

# Chemin vers les templates HTML
TEMPLATE_PATH = Path(__file__).parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_PATH))

async def send_email(template_name: str, to: str, subject: str, context: dict, background_tasks: BackgroundTasks):
    template = jinja_env.get_template(template_name)
    html_content = template.render(**context)

    message = MessageSchema(
        subject=subject,
        recipients=[to],
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)
