import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.audit import log_audit


class SchedulingInput(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_email: str
    role: str
    time_zone: str = "UTC"


class CalendarSlot(BaseModel):
    slot_id: str
    start_time: str
    end_time: str
    interviewer: str
    mode: str = "Google Meet / STAP Video Room"


class SchedulingOutput(BaseModel):
    candidate_id: str
    proposed_slots: List[CalendarSlot]
    selected_slot: CalendarSlot
    calendar_invite_status: str
    note: str


def run_scheduling_agent(
    input_data: SchedulingInput,
    db: Session,
    run_id: Optional[str] = None,
) -> SchedulingOutput:
    """
    Scheduling Agent:
    Proposes interview time slots from mock availability and returns a calendar-style slot
    (no real calendar integration yet, per requirements).
    Logs to audit trail.
    """
    base_time = datetime.datetime.utcnow() + datetime.timedelta(days=2)
    # Propose 3 slots over the next few business days
    slots = [
        CalendarSlot(
            slot_id="slot-1",
            start_time=(base_time.replace(hour=14, minute=0, second=0)).isoformat() + "Z",
            end_time=(base_time.replace(hour=14, minute=45, second=0)).isoformat() + "Z",
            interviewer="Lead Engineer (STAP Team)",
        ),
        CalendarSlot(
            slot_id="slot-2",
            start_time=((base_time + datetime.timedelta(days=1)).replace(hour=16, minute=0, second=0)).isoformat() + "Z",
            end_time=((base_time + datetime.timedelta(days=1)).replace(hour=16, minute=45, second=0)).isoformat() + "Z",
            interviewer="Engineering Director",
        ),
        CalendarSlot(
            slot_id="slot-3",
            start_time=((base_time + datetime.timedelta(days=2)).replace(hour=11, minute=30, second=0)).isoformat() + "Z",
            end_time=((base_time + datetime.timedelta(days=2)).replace(hour=12, minute=15, second=0)).isoformat() + "Z",
            interviewer="Principal Systems Architect",
        ),
    ]

    selected = slots[0]

    output = SchedulingOutput(
        candidate_id=input_data.candidate_id,
        proposed_slots=slots,
        selected_slot=selected,
        calendar_invite_status="provisional_mock_reserved",
        note=f"Provisional calendar slot reserved for {input_data.candidate_name} ({selected.start_time} to {selected.end_time})."
    )

    log_audit(
        db=db,
        run_id=run_id,
        who="SchedulingAgent",
        action="PROPOSE_INTERVIEW_SLOTS",
        details={
            "candidate_id": input_data.candidate_id,
            "candidate_name": input_data.candidate_name,
            "selected_slot": selected.slot_id,
            "start_time": selected.start_time,
            "interviewer": selected.interviewer
        }
    )

    return output

