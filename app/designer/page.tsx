'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  Palette, 
  Plus, 
  Save, 
  Download, 
  Eye, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle,
  Trash2,
  Move,
  RotateCcw,
  Settings,
  Upload,
  Grid,
  Layers,
  Variable
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

// Template element interface
interface TemplateElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'field' | 'variable'
  x: number
  y: number
  width: number
  height: number
  content?: string
  variableName?: string
  style?: {
    fontSize?: number
    fontWeight?: string
    color?: string
    backgroundColor?: string
    borderRadius?: number
    border?: string
  }
  fieldType?: 'name' | 'email' | 'date' | 'custom'
  isDragging?: boolean
}

// Background pattern interface
interface BackgroundPattern {
  id: string
  name: string
  type: 'solid' | 'gradient' | 'pattern'
  value: string
  preview: string
}

// Variable definition interface
interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'number' | 'date'
  defaultValue: string
  description?: string
}

// Background patterns
const BACKGROUND_PATTERNS: BackgroundPattern[] = [
  {
    id: 'solid-white',
    name: 'White',
    type: 'solid',
    value: '#ffffff',
    preview: '#ffffff'
  },
  {
    id: 'solid-blue',
    name: 'Blue',
    type: 'solid',
    value: '#2563eb',
    preview: '#2563eb'
  },
  {
    id: 'gradient-blue',
    name: 'Blue Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient-gold',
    name: 'Gold Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'pattern-dots',
    name: 'Dots Pattern',
    type: 'pattern',
    value: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
    preview: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
  }
]

// Default template variables
const DEFAULT_VARIABLES: TemplateVariable[] = [
  {
    name: 'recipientName',
    label: 'Recipient Name',
    type: 'text',
    defaultValue: 'John Doe',
    description: 'Name of the credential recipient'
  },
  {
    name: 'issueDate',
    label: 'Issue Date',
    type: 'date',
    defaultValue: new Date().toLocaleDateString(),
    description: 'Date when credential was issued'
  },
  {
    name: 'credentialId',
    label: 'Credential ID',
    type: 'text',
    defaultValue: 'CRED-001',
    description: 'Unique identifier for this credential'
  },
  {
    name: 'organizationName',
    label: 'Organization',
    type: 'text',
    defaultValue: 'Your Organization',
    description: 'Name of the issuing organization'
  }
]

// Predefined templates
const PREDEFINED_TEMPLATES = [
  {
    id: 'certificate',
    name: 'Certificate Template',
    description: 'Professional certificate design',
    thumbnail: '/api/placeholder/300/200',
    background: BACKGROUND_PATTERNS[2], // Blue gradient
    elements: [
      {
        id: '1',
        type: 'text' as const,
        x: 50,
        y: 30,
        width: 500,
        height: 40,
        content: 'Certificate of Achievement',
        style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }
      },
      {
        id: '2',
        type: 'variable' as const,
        x: 50,
        y: 120,
        width: 500,
        height: 35,
        content: '{{recipientName}}',
        variableName: 'recipientName',
        style: { fontSize: 24, color: '#ffffff', textAlign: 'center', fontWeight: '600' }
      },
      {
        id: '3',
        type: 'text' as const,
        x: 50,
        y: 180,
        width: 500,
        height: 25,
        content: 'has successfully completed the requirements',
        style: { fontSize: 16, color: '#e5e7eb', textAlign: 'center' }
      },
      {
        id: '4',
        type: 'variable' as const,
        x: 50,
        y: 320,
        width: 200,
        height: 20,
        content: 'Date: {{issueDate}}',
        variableName: 'issueDate',
        style: { fontSize: 12, color: '#d1d5db' }
      },
      {
        id: '5',
        type: 'variable' as const,
        x: 350,
        y: 320,
        width: 200,
        height: 20,
        content: 'ID: {{credentialId}}',
        variableName: 'credentialId',
        style: { fontSize: 12, color: '#d1d5db', textAlign: 'right' }
      }
    ]
  },
  {
    id: 'badge',
    name: 'Digital Badge',
    description: 'Modern badge design',
    thumbnail: '/api/placeholder/300/200',
    background: BACKGROUND_PATTERNS[0], // White
    elements: [
      {
        id: '1',
        type: 'shape' as const,
        x: 250,
        y: 150,
        width: 100,
        height: 100,
        style: { backgroundColor: '#2563eb', borderRadius: 50 }
      },
      {
        id: '2',
        type: 'variable' as const,
        x: 50,
        y: 280,
        width: 500,
        height: 30,
        content: '{{recipientName}}',
        variableName: 'recipientName',
        style: { fontSize: 20, color: '#1f2937', textAlign: 'center', fontWeight: 'bold' }
      },
      {
        id: '3',
        type: 'variable' as const,
        x: 50,
        y: 320,
        width: 500,
        height: 20,
        content: '{{organizationName}}',
        variableName: 'organizationName',
        style: { fontSize: 14, color: '#6b7280', textAlign: 'center' }
      }
    ]
  }
]

export default function DesignerPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [elements, setElements] = useState<TemplateElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [templateName, setTemplateName] = useState('Untitled Template')
  const [currentBackground, setCurrentBackground] = useState<BackgroundPattern>(BACKGROUND_PATTERNS[0])
  const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>(DEFAULT_VARIABLES)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = PREDEFINED_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setElements(template.elements)
      setTemplateName(template.name)
      setCurrentBackground(template.background)
      setTemplateVariables(DEFAULT_VARIABLES)
    }
  }

  // Handle new blank template
  const handleNewTemplate = () => {
    setSelectedTemplate('blank')
    setElements([])
    setTemplateName('New Template')
    setCurrentBackground(BACKGROUND_PATTERNS[0])
    setTemplateVariables(DEFAULT_VARIABLES)
  }

  // Add new element to canvas
  const addElement = (type: TemplateElement['type']) => {
    const newElement: TemplateElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : type === 'variable' ? 250 : 100,
      height: type === 'text' ? 30 : type === 'variable' ? 30 : 100,
      content: type === 'text' ? 'Sample Text' : 
               type === 'field' ? 'Field Name' : 
               type === 'variable' ? '{{recipientName}}' : undefined,
      variableName: type === 'variable' ? 'recipientName' : undefined,
      style: {
        fontSize: 16,
        color: '#1f2937',
        backgroundColor: type === 'shape' ? '#e5e7eb' : 'transparent'
      }
    }
    setElements([...elements, newElement])
  }

  // Handle drag start
  const handleDragStart = useCallback((elementId: string, event: React.MouseEvent) => {
    setElements(prevElements => {
      const element = prevElements.find(el => el.id === elementId)
      if (!element) return prevElements
      
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return prevElements
      
      setDraggedElement(elementId)
      setDragOffset({
        x: event.clientX - rect.left - element.x,
        y: event.clientY - rect.top - element.y
      })
      
      return prevElements.map(el => 
        el.id === elementId ? { ...el, isDragging: true } : el
      )
    })
  }, [])

  // Handle drag move
  const handleDragMove = useCallback((event: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const newX = Math.max(0, Math.min(600 - 50, event.clientX - rect.left - dragOffset.x))
    const newY = Math.max(0, Math.min(400 - 30, event.clientY - rect.top - dragOffset.y))
    
    setElements(prevElements => 
      prevElements.map(el => 
        el.id === draggedElement ? { ...el, x: newX, y: newY } : el
      )
    )
  }, [draggedElement, dragOffset])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (draggedElement) {
      setElements(prevElements => 
        prevElements.map(el => 
          el.id === draggedElement ? { ...el, isDragging: false } : el
        )
      )
      setDraggedElement(null)
      setDragOffset({ x: 0, y: 0 })
    }
  }, [draggedElement])

  // Replace variables in content
  const replaceVariables = (content: string): string => {
    let result = content
    templateVariables.forEach(variable => {
      const regex = new RegExp(`{{${variable.name}}}`, 'g')
      result = result.replace(regex, variable.defaultValue)
    })
    return result
  }

  // Update variable value
  const updateVariable = (name: string, value: string) => {
    setTemplateVariables(prev => 
      prev.map(variable => 
        variable.name === name ? { ...variable, defaultValue: value } : variable
      )
    )
  }

  // Update element properties
  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    setElements(prevElements => 
      prevElements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    )
  }

  // Delete element
  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    setSelectedElement(null)
  }

  // Save template
  const handleSave = () => {
    const templateData = {
      name: templateName,
      elements,
      createdAt: new Date().toISOString()
    }
    // Save to localStorage for demo purposes
    localStorage.setItem(`template_${Date.now()}`, JSON.stringify(templateData))
    toast.success('Template saved successfully!')
  }

  // Export template
  const handleExport = () => {
    const templateData = {
      name: templateName,
      elements,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateName.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render element on canvas
  const renderElement = (element: TemplateElement) => {
    const isSelected = selectedElement === element.id
    const isDragging = element.isDragging
    const baseStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: isSelected ? '2px solid #2563eb' : isDragging ? '2px dashed #2563eb' : '1px solid transparent',
      cursor: isDragging ? 'grabbing' : 'grab',
      opacity: isDragging ? 0.8 : 1,
      zIndex: isDragging ? 1000 : 1,
      ...element.style
    }

    const handleElementClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedElement(element.id)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      handleDragStart(element.id, e)
    }

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleElementClick}
            onMouseDown={handleMouseDown}
            className="flex items-center justify-center select-none"
          >
            {element.content}
          </div>
        )
      case 'variable':
        const displayContent = isPreviewMode ? replaceVariables(element.content || '') : element.content
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleElementClick}
            onMouseDown={handleMouseDown}
            className="flex items-center justify-center bg-green-50 border-dashed border-green-300 select-none"
          >
            <span className="text-green-700 text-sm font-medium">
              {displayContent}
            </span>
            {!isPreviewMode && (
              <Variable className="ml-1 h-3 w-3 text-green-600" />
            )}
          </div>
        )
      case 'field':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleElementClick}
            onMouseDown={handleMouseDown}
            className="flex items-center justify-center bg-blue-50 border-dashed border-blue-300 select-none"
          >
            <span className="text-blue-600 text-sm">{element.content}</span>
          </div>
        )
      case 'shape':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleElementClick}
            onMouseDown={handleMouseDown}
            className="select-none"
          />
        )
      case 'image':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleElementClick}
            onMouseDown={handleMouseDown}
            className="bg-gray-200 flex items-center justify-center select-none"
          >
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )
      default:
        return null
    }
  }

  // If no template selected, show template selection
  if (!selectedTemplate) {
    return (
      <div className="flex h-full flex-col">
        {/* Page Header */}
        <div className="border-b border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
                Template Designer
              </h1>
              <p className="text-sm text-didmgmt-text-secondary">
                Create and customize credential templates
              </p>
            </div>
            <Button 
              className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" 
              onClick={handleNewTemplate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Blank Template
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Choose a Template</h2>
            <p className="text-sm text-didmgmt-text-secondary">
              Start with a pre-designed template or create from scratch
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREDEFINED_TEMPLATES.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Palette className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-didmgmt-blue hover:bg-didmgmt-blue/90">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Main designer interface
  return (
    <div className="flex h-full">
      {/* Left Sidebar - Tools */}
       <div className="w-80 border-r border-border bg-background p-4 overflow-y-auto">
         <Tabs defaultValue="elements" className="w-full">
           <TabsList className="grid w-full grid-cols-3">
             <TabsTrigger value="elements">Elements</TabsTrigger>
             <TabsTrigger value="background">Background</TabsTrigger>
             <TabsTrigger value="variables">Variables</TabsTrigger>
           </TabsList>
           
           <TabsContent value="elements" className="mt-4">
             <div className="space-y-2">
               <Button 
                 variant="outline" 
                 className="w-full justify-start"
                 onClick={() => addElement('text')}
               >
                 <Type className="mr-2 h-4 w-4" />
                 Text
               </Button>
               <Button 
                 variant="outline" 
                 className="w-full justify-start"
                 onClick={() => addElement('variable')}
               >
                 <Variable className="mr-2 h-4 w-4" />
                 Variable
               </Button>
               <Button 
                 variant="outline" 
                 className="w-full justify-start"
                 onClick={() => addElement('field')}
               >
                 <Square className="mr-2 h-4 w-4" />
                 Field
               </Button>
               <Button 
                 variant="outline" 
                 className="w-full justify-start"
                 onClick={() => addElement('image')}
               >
                 <ImageIcon className="mr-2 h-4 w-4" />
                 Image
               </Button>
               <Button 
                 variant="outline" 
                 className="w-full justify-start"
                 onClick={() => addElement('shape')}
               >
                 <Circle className="mr-2 h-4 w-4" />
                 Shape
               </Button>
             </div>
           </TabsContent>
           
           <TabsContent value="background" className="mt-4">
             <div className="space-y-4">
               <h3 className="font-semibold">Background Patterns</h3>
               <div className="grid grid-cols-2 gap-2">
                 {BACKGROUND_PATTERNS.map((pattern) => (
                   <div
                     key={pattern.id}
                     className={`aspect-square rounded-lg border-2 cursor-pointer transition-all ${
                       currentBackground.id === pattern.id 
                         ? 'border-blue-500 ring-2 ring-blue-200' 
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                     style={{ background: pattern.preview }}
                     onClick={() => setCurrentBackground(pattern)}
                     title={pattern.name}
                   />
                 ))}
               </div>
               <div className="text-sm text-gray-600">
                 Selected: <span className="font-medium">{currentBackground.name}</span>
               </div>
             </div>
           </TabsContent>
           
           <TabsContent value="variables" className="mt-4">
             <div className="space-y-4">
               <h3 className="font-semibold">Template Variables</h3>
               {templateVariables.map((variable) => (
                 <div key={variable.name} className="space-y-2">
                   <Label htmlFor={variable.name} className="text-sm font-medium">
                     {variable.label}
                   </Label>
                   <Input
                     id={variable.name}
                     value={variable.defaultValue}
                     onChange={(e) => updateVariable(variable.name, e.target.value)}
                     placeholder={variable.description}
                   />
                   {variable.description && (
                     <p className="text-xs text-gray-500">{variable.description}</p>
                   )}
                 </div>
               ))}
             </div>
           </TabsContent>
         </Tabs>

        {/* Element Properties */}
        {selectedElement && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Properties</h3>
            {(() => {
              const element = elements.find(el => el.id === selectedElement)
              if (!element) return null

              return (
                <div className="space-y-3">
                  {element.type === 'text' && (
                     <>
                       <div>
                         <Label htmlFor="content">Content</Label>
                         <Input
                           id="content"
                           value={element.content || ''}
                           onChange={(e) => updateElement(element.id, { content: e.target.value })}
                         />
                       </div>
                       <div>
                         <Label htmlFor="fontSize">Font Size</Label>
                         <Input
                           id="fontSize"
                           type="number"
                           value={element.style?.fontSize || 16}
                           onChange={(e) => updateElement(element.id, { 
                             style: { ...element.style, fontSize: parseInt(e.target.value) }
                           })}
                         />
                       </div>
                     </>
                   )}
                   
                   {element.type === 'variable' && (
                     <>
                       <div>
                         <Label htmlFor="variableName">Variable</Label>
                         <Select
                           value={element.variableName || 'recipientName'}
                           onValueChange={(value) => {
                             const variable = templateVariables.find(v => v.name === value)
                             updateElement(element.id, { 
                               variableName: value,
                               content: `{{${value}}}`
                             })
                           }}
                         >
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             {templateVariables.map((variable) => (
                               <SelectItem key={variable.name} value={variable.name}>
                                 {variable.label}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                       <div>
                         <Label htmlFor="fontSize">Font Size</Label>
                         <Input
                           id="fontSize"
                           type="number"
                           value={element.style?.fontSize || 16}
                           onChange={(e) => updateElement(element.id, { 
                             style: { ...element.style, fontSize: parseInt(e.target.value) }
                           })}
                         />
                       </div>
                     </>
                   )}
                   
                   {element.type === 'field' && (
                     <>
                       <div>
                         <Label htmlFor="fieldType">Field Type</Label>
                         <Select
                           value={element.fieldType || 'custom'}
                           onValueChange={(value) => updateElement(element.id, { fieldType: value as any })}
                         >
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="name">Name</SelectItem>
                             <SelectItem value="email">Email</SelectItem>
                             <SelectItem value="date">Date</SelectItem>
                             <SelectItem value="custom">Custom</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </>
                   )}

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={element.style?.color || '#000000'}
                      onChange={(e) => updateElement(element.id, { 
                        style: { ...element.style, color: e.target.value }
                      })}
                    />
                  </div>

                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => deleteElement(element.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b border-border bg-background px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-48"
              />
              <Badge variant="secondary">{elements.length} elements</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>
                <Eye className="mr-2 h-4 w-4" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedTemplate(null)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-50 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div 
              ref={canvasRef}
              className="bg-white shadow-lg rounded-lg relative"
              style={{ 
                width: 600, 
                height: 400, 
                minHeight: 400,
                background: currentBackground.value
              }}
              onClick={() => setSelectedElement(null)}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
            >
              {elements.map(renderElement)}
              
              {/* Canvas overlay for preview mode */}
              {isPreviewMode && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                    <span className="text-sm font-medium">Preview Mode</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
