import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'

/**
 * Fee records for one session. A record only exists for a student/month once
 * an admin has set a due amount or logged a payment for it — see
 * buildFeeMatrix() in utils/feeCalculators.js for how missing months are
 * filled in as "pending" for display.
 *
 * @param {string | undefined} sessionId
 */
export function useFees(sessionId) {
  const [feeRecords, setFeeRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeeRecords = useCallback(async () => {
    if (!sessionId) {
      setFeeRecords([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('fee_records')
      .select('*')
      .eq('session_id', sessionId)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setFeeRecords(data)
    }
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    fetchFeeRecords()
  }, [fetchFeeRecords])

  /**
   * Creates or updates the fee_records row for one student/month. Due and
   * paid amounts are set together so a single "Collect fee" action can both
   * set what's owed and log what's been received.
   */
  const recordPayment = async ({
    studentId,
    month,
    amountDue,
    amountPaid,
    paymentDate,
    paymentMode,
    remarks,
  }) => {
    const { data, error: upsertError } = await supabase
      .from('fee_records')
      .upsert(
        {
          student_id: studentId,
          session_id: sessionId,
          month,
          amount_due: amountDue,
          amount_paid: amountPaid,
          payment_date: paymentDate || null,
          payment_mode: paymentMode || null,
          remarks: remarks || null,
        },
        { onConflict: 'student_id,session_id,month' }
      )
      .select()
      .single()

    if (upsertError) throw upsertError

    setFeeRecords((prev) => {
      const idx = prev.findIndex((r) => r.student_id === studentId && r.month === month)
      if (idx === -1) return [...prev, data]
      const next = [...prev]
      next[idx] = data
      return next
    })

    return data
  }

  return { feeRecords, loading, error, refetch: fetchFeeRecords, recordPayment }
}
