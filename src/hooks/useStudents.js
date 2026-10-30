import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'

/**
 * @param {{ class?: string, section?: string, isActive?: boolean, search?: string }} filters
 */
export function useStudents(filters = {}) {
  const { class: className, section, isActive, search } = filters
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from('students').select('*').order('full_name', { ascending: true })
    if (className) query = query.eq('class', className)
    if (section) query = query.eq('section', section)
    if (isActive !== undefined) query = query.eq('is_active', isActive)
    if (search) query = query.or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%`)

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setStudents(data)
    }
    setLoading(false)
  }, [className, section, isActive, search])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const addStudent = async (studentData) => {
    const { data, error: insertError } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single()
    if (insertError) throw insertError
    setStudents((prev) => [...prev, data].sort((a, b) => a.full_name.localeCompare(b.full_name)))
    return data
  }

  const updateStudent = async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    setStudents((prev) => prev.map((s) => (s.id === id ? data : s)))
    return data
  }

  const deleteStudent = async (id) => {
    const { error: deleteError } = await supabase.from('students').delete().eq('id', id)
    if (deleteError) throw deleteError
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
  }
}
