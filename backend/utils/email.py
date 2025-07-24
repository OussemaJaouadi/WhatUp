
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from core.config import settings
from jinja2 import Environment, FileSystemLoader, TemplateNotFound

from typing import Any

class EmailHandler:
    def __init__(self, templates_path: str):
        self.api_key = settings.BREVO_API_KEY
        self.sender_email = settings.BREVO_SENDER_EMAIL
        self.jinja_env = Environment(loader=FileSystemLoader(templates_path))

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = self.api_key
        self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    async def _verify_template_exists(self, template_name: str) -> bool:
        try:
            self.jinja_env.get_template(template_name)
            return True
        except TemplateNotFound:
            return False
        except Exception:
            return False

    async def _template_before_send(self, template_name: str, context: dict[str, Any]) -> str:
        try:
            template = self.jinja_env.get_template(template_name)
            return template.render(**context)
        except TemplateNotFound:
            raise ValueError(f"Template '{template_name}' not found.")

    async def send_to_person(self, to: str, subject: str, template_name: str, context: dict[str, Any]) -> bool:
        """
        Send an email to a single person using a template and context.
        """
        if not await self._verify_template_exists(template_name):
            raise ValueError(f"Template '{template_name}' does not exist.")
        html_body = await self._template_before_send(template_name, context)

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            sender={"name": "WhatUp Support", "email": self.sender_email},
            to=[{"email": to}],
            subject=subject,
            html_content=html_body
        )

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: self.api_instance.send_transac_email(send_smtp_email))
            print(f"Brevo API Response: {response}")
            return True
        except ApiException as e:
            print(f"❌ Brevo API Exception when calling SMTPApi->send_transac_email: {e} ❌")
            return False
        except Exception as e:
            print(f"❌ Brevo SDK exception: {e} ❌")
            return False

    async def send_to_group(self, to_list: list[str], subject: str, template_name: str, context: dict[str, Any]) -> bool:
        """
        Send an email to a group of recipients using a template and context.
        """
        if not await self._verify_template_exists(template_name):
            raise ValueError(f"Template '{template_name}' does not exist.")
        html_body = await self._template_before_send(template_name, context)

        recipients = [{"email": email_address} for email_address in to_list]

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            sender={"name": "WhatUp Support", "email": self.sender_email},
            to=recipients,
            subject=subject,
            html_content=html_body
        )

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: self.api_instance.send_transac_email(send_smtp_email))
            print(f"Brevo API Response: {response}")
            return True
        except ApiException as e:
            print(f"❌ Brevo API Exception when calling SMTPApi->send_transac_email: {e} ❌")
            return False
        except Exception as e:
            print(f"❌ Brevo SDK exception: {e} ❌")
            return False
