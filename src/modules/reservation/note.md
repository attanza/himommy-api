## RESERVATION STATUS
  1. NEW 
  2. NEW_USER_UPDATE 
  3. NEW_TOCOLOGIST_UPDATE 
  4. ACCEPTED 
  5. REJECTED 
  6. CANCEL 
  7. COMPLETE_CONFIRM 
  8. COMPLETED 

## STATUS ALLOWED FOR USER
  1. NEW_USER_UPDATE
  2. CANCEL 
  3. COMPLETED

## STATUS ALLOWED FOR TOCOLOGIST
  1. NEW_TOCOLOGIST_UPDATE
  2. ACCEPTED 
  3. REJECTED
  4. COMPLETE_CONFIRM


## RESERVATION FLOW
1. User create a reservation (Status NEW)
2. Notification will be sent to Tocologist (topic: reservations/NEW/:tocologistId)
3. Receiver (tocologist)
   - Can change date or service if needed (Status NEW_TOCOLOGIST_UPDATE) -> (TOPIC: reservations/)
   - Can REJECT with submiting reason (status REJECTED)
   - Can Accept (status ACCEPTED)
4. Status REJECTED, reservation will no longer valid, cannot be change, etc. User will be notified with topic (reservations/REJECTED/:userId)
5. Status ACCEPTED, user wil be notified with topic (reservations/ACCEPTED/:userId)
6. Status NEW_TOCOLOGIST_UPDATE, means that the tocologist updated the new reservation data and needing the  requestor to confirm
7. if user response the NEW_TOCOLOGIST_UPDATE the status will change to NEW_USER_UPDATE 
8. if reservation has finished than tocologist will change status to COMPLETE_CONFIRM, means that requires user to COMPLETED the reservation, with submitting ratings, comments etc