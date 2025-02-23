"use client"
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import Cookies from "js-cookie";

interface MedicalHistory {
  allergies: string[]
  current_medications: string[]
  family_medical_history: string[]
  past_medical_diagnoses: string[]
}

interface EditableSectionProps {
  title: string
  items?: string[]
  onUpdate: (newItems: string[]) => void
  isEditing: boolean
}

const EditableSection = ({ title, items = [], onUpdate, isEditing }: EditableSectionProps) => {
  const [newItem, setNewItem] = useState('')
  const { theme } = useTheme()

  const handleAddItem = () => {
    if (newItem.trim()) {
      onUpdate([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const handleDeleteItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index))
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-3 py-1 rounded-full ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-200' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {item}
              {isEditing && (
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="ml-2 text-sm hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        {isEditing && (
          <div className="flex items-center gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder={`Add new ${title.toLowerCase()}`}
              className="max-w-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              +
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const LoadingSkeleton = () => (
  <div className="container mx-auto p-4 space-y-8">
    <Skeleton className="h-12 w-1/3 mb-8" />
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function MedicalHistoryPage() {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    allergies: [],
    current_medications: [],
    family_medical_history: [],
    past_medical_diagnoses: []
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const sex = Cookies.get("access_token");
        const a = "Bearer " + sex;
        const response = await axios.get("http://127.0.0.1:8000/utils/decode_user/", {
        headers: { Authorization: a },
        });
        const email = response.data.email;
       // In fetchMedicalHistory
        const res = await axios.get(`http://127.0.0.1:8000/user/get_medical_history/${email}/`, {
            headers: { Authorization: a },
        });
        setMedicalHistory(res.data.medical_history);
      } catch (error) {
        console.error('Error fetching medical history:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMedicalHistory()
  }, [])

  const handleUpdateHistory = async () => {
    try {
      const token = Cookies.get("access_token");
      console.log(token)
      const authHeader = `Bearer ${token}`;
      const response = await axios.get("http://127.0.0.1:8000/utils/decode_user/", {
      headers: { Authorization: authHeader },
    });

      // Convert frontend field names to backend format
      const backendPayload = {
        allergies: medicalHistory.allergies,
        current_medications: medicalHistory.current_medications,
        family_medical_history: medicalHistory.family_medical_history,
        past_medical_diagnoses: medicalHistory.past_medical_diagnoses,
        email: response.data.email
      };
      console.log(backendPayload)
      const { data } = await axios.post(
        `http://127.0.0.1:8000/user/update_medical_history/`,
        backendPayload,
        { headers: { Authorization: authHeader } }
      );
  
      setMedicalHistory({
        allergies: data.medical_history.allergies,
        current_medications: data.medical_history.current_medications,
        family_medical_history: data.medical_history.family_medical_history,
        past_medical_diagnoses: data.medical_history.past_medical_diagnoses
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Medical History</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHistory}>Update Details</Button>
          </div>
        )}
      </div>

      <EditableSection
        title="Allergies"
        items={medicalHistory.allergies}
        onUpdate={(newItems) => {
            setMedicalHistory({ ...medicalHistory, allergies: newItems })
            console.log(medicalHistory)
        }}
        isEditing={isEditing}
      />

      <EditableSection
        title="Current Medications"
        items={medicalHistory.current_medications}
        onUpdate={(newItems) => setMedicalHistory({ ...medicalHistory, current_medications: newItems })}
        isEditing={isEditing}
      />

      <EditableSection
        title="Family Medical History"
        items={medicalHistory.family_medical_history}
        onUpdate={(newItems) => setMedicalHistory({ ...medicalHistory, family_medical_history: newItems })}
        isEditing={isEditing}
      />

      <EditableSection
        title="Past Medical Diagnoses"
        items={medicalHistory.past_medical_diagnoses}
        onUpdate={(newItems) => setMedicalHistory({ ...medicalHistory, past_medical_diagnoses: newItems })}
        isEditing={isEditing}
      />
    </div>
  )
}