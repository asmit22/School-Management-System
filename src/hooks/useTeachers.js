import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'

/**
 * @param {{ isActive?: boolean, search?: string }} filters
 */
export function useTeachers(filters = {}) {
  const { isActive, search } = filters
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from('teachers').select('*').order('full_name', { ascending: true })
    if (isActive !== undefined) query = query.eq('is_active', isActive)
    if (search) query = query.or(`full_name.ilike.%${search}%,employee_code.ilike.%${search}%`)

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTeachers(data)
    }
    setLoading(false)
  }, [isActive, search])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const addTeacher = async (teacherData) => {
    const { data, error: insertError } = await supabase
      .from('teachers')
      .insert(teacherData)
      .select()
      .single()
    if (insertError) throw insertError
    setTeachers((prev) => [...prev, data].sort((a, b) => a.full_name.localeCompare(b.full_name)))
    return data
  }

  const updateTeacher = async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    setTeachers((prev) => prev.map((t) => (t.id === id ? data : t)))
    return data
  }

  const deleteTeacher = async (id) => {
    const { error: deleteError } = await supabase.from('teachers').delete().eq('id', id)
    if (deleteError) throw deleteError
    setTeachers((prev) => prev.filter((t) => t.id !== id))
  }

  return {
    teachers,
    loading,
    error,
    refetch: fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
  }
}
