"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  Clock,
  Users,
  Zap
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import migrationData from "@/data/skill-migration-data.json"
import skillVersions from "@/data/skill-versions.json"

interface BreakingChange {
  id: string
  skill: string
  affectedVersions: { from: string; to: string }
  targetVersion: string
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  impact: string
  migration: string[]
  codeExample?: {
    before: string
    after: string
  }
}

interface MigrationMetrics {
  time?: string
  errors?: number
  performance?: string
  [key: string]: string | number | undefined
}

interface SuccessStory {
  id: string
  title: string
  agent: string
  timeframe: string
  before: {
    version: string
    issues: string[]
    metrics: MigrationMetrics
  }
  after: {
    version: string
    improvements: string[]
    metrics: MigrationMetrics
  }
  testimonial: string
  author: string
  tags: string[]
}

const severityConfig = {
  critical: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: AlertTriangle,
    label: "Critical"
  },
  warning: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: AlertCircle,
    label: "Warning"
  },
  info: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: Info,
    label: "Info"
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0
    if (num1 !== num2) return num1 - num2
  }
  return 0
}

function isVersionInRange(version: string, from: string, to: string): boolean {
  return compareVersions(version, from) >= 0 && compareVersions(version, to) <= 0
}

export default function MigrationGuidePage() {
  const [activeTab, setActiveTab] = useState<string>("wizard")
  const [selectedSkill, setSelectedSkill] = useState<string>("")
  const [sourceVersion, setSourceVersion] = useState<string>("")
  const [targetVersion, setTargetVersion] = useState<string>("")
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedStory, setExpandedStory] = useState<string | null>(null)
  
  // Compatibility checker state
  const [hostSelection, setHostSelection] = useState<string>("")
  const [runtimeSelection, setRuntimeSelection] = useState<string>("")

  const skills = migrationData.skills
  const breakingChanges = migrationData.breakingChanges as BreakingChange[]
  const successStories = migrationData.successStories as SuccessStory[]
  const compatibilityMatrix = migrationData.compatibilityMatrix

  const selectedSkillData = skills.find(s => s.slug === selectedSkill)
  const availableVersions = selectedSkillData?.versions || []

  // Filter breaking changes based on selected migration path
  const relevantChanges = useMemo(() => {
    if (!selectedSkill || !sourceVersion || !targetVersion) return []
    
    return breakingChanges.filter(change => {
      if (change.skill !== selectedSkill) return false
      
      // Check if source version is affected and target version includes the breaking change
      const sourceAffected = isVersionInRange(
        sourceVersion, 
        change.affectedVersions.from, 
        change.affectedVersions.to
      )
      const targetIncludesChange = compareVersions(targetVersion, change.targetVersion) >= 0
      const sourceBeforeChange = compareVersions(sourceVersion, change.targetVersion) < 0
      
      return sourceAffected && targetIncludesChange && sourceBeforeChange
    }).sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }, [selectedSkill, sourceVersion, targetVersion, breakingChanges])

  // Generate migration checklist
  const migrationChecklist = useMemo(() => {
    if (relevantChanges.length === 0) return []
    
    const checklist: Array<{ id: string; text: string; category: string }> = [
      { id: "backup", text: "Create backup of current workspace", category: "preparation" },
      { id: "git", text: "Commit all changes to git", category: "preparation" },
      { id: "test-current", text: "Run tests to verify current setup works", category: "preparation" }
    ]

    relevantChanges.forEach((change, idx) => {
      change.migration.forEach((step, stepIdx) => {
        checklist.push({
          id: `${change.id}-${stepIdx}`,
          text: step,
          category: change.title
        })
      })
    })

    checklist.push(
      { id: "update-version", text: `Update skill to version ${targetVersion}`, category: "deployment" },
      { id: "test-migration", text: "Run tests to verify migration", category: "deployment" },
      { id: "monitor", text: "Monitor for issues in production", category: "deployment" }
    )

    return checklist
  }, [relevantChanges, targetVersion])

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  const copyChecklist = () => {
    const text = migrationChecklist
      .map(item => `- [ ] ${item.text}`)
      .join('\n')
    
    navigator.clipboard.writeText(text)
    setCopiedId('checklist')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyCodeExample = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter success stories by selected skill
  const relevantStories = selectedSkill 
    ? successStories.filter(story => {
        const skillName = selectedSkillData?.name.toLowerCase() || ""
        return story.title.toLowerCase().includes(skillName) || 
               story.tags.some(tag => skillName.includes(tag))
      })
    : successStories

  // Check compatibility
  const compatibilityResults = useMemo(() => {
    if (!selectedSkill || !hostSelection || !runtimeSelection) return null

    const host = compatibilityMatrix.hosts.find(h => h.name === hostSelection)
    const runtime = compatibilityMatrix.runtimes.find(r => r.name === runtimeSelection)
    const deps = compatibilityMatrix.dependencies[selectedSkill as keyof typeof compatibilityMatrix.dependencies]

    return {
      hostCompatible: host?.supported || false,
      hostNote: host?.note,
      runtimeCompatible: !deps?.requires.length || runtime !== undefined,
      runtimeRequired: deps?.requires || [],
      optionalDeps: deps?.optional || [],
      conflicts: deps?.conflicts || []
    }
  }, [selectedSkill, hostSelection, runtimeSelection, compatibilityMatrix])

  const progress = migrationChecklist.length > 0 
    ? Math.round((checkedItems.size / migrationChecklist.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/20 text-[#06D6A0] text-sm mb-6">
              <span>🔄</span>
              <span>Skill Version Migration</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Skill Version Diff & Migration Guide
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Compare skill versions, identify breaking changes, and generate step-by-step migration checklists for seamless upgrades.
            </p>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="wizard">Migration Wizard</TabsTrigger>
          <TabsTrigger value="changes">Breaking Changes</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
        </TabsList>

        {/* Migration Wizard */}
        <TabsContent value="wizard" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Select Migration Path</CardTitle>
              <CardDescription>Choose a skill and the versions you want to migrate between</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skill Selection */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">Skill</label>
                <Select value={selectedSkill} onValueChange={(value) => {
                  setSelectedSkill(value)
                  setSourceVersion("")
                  setTargetVersion("")
                  setCheckedItems(new Set())
                }}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10">
                    <SelectValue placeholder="Select a skill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map(skill => (
                      <SelectItem key={skill.slug} value={skill.slug}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSkill && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Source Version */}
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">From Version</label>
                    <Select value={sourceVersion} onValueChange={setSourceVersion}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10">
                        <SelectValue placeholder="Select source version..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVersions.map(version => (
                          <SelectItem key={version} value={version}>
                            v{version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Version */}
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">To Version</label>
                    <Select value={targetVersion} onValueChange={setTargetVersion}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10">
                        <SelectValue placeholder="Select target version..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVersions
                          .filter(v => !sourceVersion || compareVersions(v, sourceVersion) > 0)
                          .map(version => (
                            <SelectItem key={version} value={version}>
                              v{version}
                              {version === selectedSkillData?.latestVersion && (
                                <Badge className="ml-2 text-xs" variant="outline">Latest</Badge>
                              )}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Migration Summary */}
              {selectedSkill && sourceVersion && targetVersion && (
                <div className="p-4 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30">
                  <h3 className="font-semibold text-[#06D6A0] mb-2">Migration Summary</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <p>
                      <span className="text-white/90">Skill:</span> {selectedSkillData?.name}
                    </p>
                    <p>
                      <span className="text-white/90">Path:</span> v{sourceVersion} → v{targetVersion}
                    </p>
                    <p>
                      <span className="text-white/90">Breaking Changes:</span>{" "}
                      <span className={relevantChanges.length > 0 ? "text-yellow-400 font-semibold" : "text-[#06D6A0]"}>
                        {relevantChanges.length} {relevantChanges.length === 1 ? "issue" : "issues"} found
                      </span>
                    </p>
                    {relevantChanges.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">
                          Review breaking changes before migrating
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Breaking Changes Message */}
              {selectedSkill && sourceVersion && targetVersion && relevantChanges.length === 0 && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-400 mb-1">Clean Migration Path</h3>
                      <p className="text-sm text-white/70">
                        No breaking changes detected between these versions. You can upgrade safely by updating the skill version.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Relevant Breaking Changes */}
              {relevantChanges.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Breaking Changes Detected</h3>
                  {relevantChanges.map(change => {
                    const config = severityConfig[change.severity]
                    const Icon = config.icon
                    
                    return (
                      <Card key={change.id} className={`${config.bg} border ${config.border}`}>
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={`${config.color} ${config.border}`}>
                                  {config.label}
                                </Badge>
                                <Badge variant="outline" className="text-white/60 border-white/20">
                                  v{change.targetVersion}
                                </Badge>
                              </div>
                              <CardTitle className="text-white mb-2">{change.title}</CardTitle>
                              <CardDescription className="text-white/70">
                                {change.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white/90 mb-2">Impact</h4>
                            <p className="text-sm text-white/70">{change.impact}</p>
                          </div>
                          
                          {change.codeExample && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-white/90">Code Changes</h4>
                              <div className="space-y-2">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-red-400 flex items-center gap-1">
                                      <span>❌</span> Before
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 text-xs"
                                      onClick={() => copyCodeExample(`${change.id}-before`, change.codeExample!.before)}
                                    >
                                      {copiedId === `${change.id}-before` ? (
                                        <><Check className="w-3 h-3 mr-1" /> Copied</>
                                      ) : (
                                        <><Copy className="w-3 h-3 mr-1" /> Copy</>
                                      )}
                                    </Button>
                                  </div>
                                  <pre className="bg-black/50 border border-white/10 rounded p-3 overflow-x-auto text-xs">
                                    <code className="text-white">{change.codeExample.before}</code>
                                  </pre>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-[#06D6A0] flex items-center gap-1">
                                      <span>✅</span> After
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 text-xs"
                                      onClick={() => copyCodeExample(`${change.id}-after`, change.codeExample!.after)}
                                    >
                                      {copiedId === `${change.id}-after` ? (
                                        <><Check className="w-3 h-3 mr-1" /> Copied</>
                                      ) : (
                                        <><Copy className="w-3 h-3 mr-1" /> Copy</>
                                      )}
                                    </Button>
                                  </div>
                                  <pre className="bg-black/50 border border-[#06D6A0]/30 rounded p-3 overflow-x-auto text-xs">
                                    <code className="text-white">{change.codeExample.after}</code>
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breaking Changes Database */}
        <TabsContent value="changes" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>All Breaking Changes</CardTitle>
              <CardDescription>
                Complete database of known breaking changes across all skill versions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breakingChanges.map(change => {
                  const config = severityConfig[change.severity]
                  const Icon = config.icon
                  
                  return (
                    <Card key={change.id} className={`${config.bg} border ${config.border}`}>
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className={`${config.color} ${config.border}`}>
                                {config.label}
                              </Badge>
                              <Badge variant="outline" className="text-white/60 border-white/20">
                                {skills.find(s => s.slug === change.skill)?.name}
                              </Badge>
                              <Badge variant="outline" className="text-white/60 border-white/20">
                                v{change.affectedVersions.from} - v{change.affectedVersions.to} → v{change.targetVersion}
                              </Badge>
                            </div>
                            <CardTitle className="text-white">{change.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-white/70">{change.description}</p>
                        <div>
                          <h4 className="text-sm font-semibold text-white/90 mb-2">Migration Steps</h4>
                          <ul className="space-y-1">
                            {change.migration.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                                <span className="text-[#06D6A0] mt-0.5">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Migration Checklist */}
        <TabsContent value="checklist" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Migration Checklist</CardTitle>
                  <CardDescription>
                    Auto-generated checklist based on your selected migration path
                  </CardDescription>
                </div>
                {migrationChecklist.length > 0 && (
                  <Button
                    onClick={copyChecklist}
                    variant="outline"
                    size="sm"
                    className="border-[#06D6A0]/30 text-[#06D6A0] hover:bg-[#06D6A0]/10"
                  >
                    {copiedId === 'checklist' ? (
                      <><Check className="w-4 h-4 mr-2" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copy All</>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {migrationChecklist.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">No migration path selected</p>
                  <p className="text-sm text-white/40">
                    Go to the Migration Wizard tab to select a skill and versions
                  </p>
                </div>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">Progress</span>
                      <span className="text-sm font-medium text-[#06D6A0]">
                        {checkedItems.size} / {migrationChecklist.length} steps ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#06D6A0] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-6">
                    {Array.from(new Set(migrationChecklist.map(item => item.category))).map(category => {
                      const categoryItems = migrationChecklist.filter(item => item.category === category)
                      const categoryProgress = categoryItems.filter(item => checkedItems.has(item.id)).length
                      
                      return (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                              {category}
                            </h3>
                            <span className="text-xs text-white/50">
                              {categoryProgress} / {categoryItems.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {categoryItems.map(item => (
                              <div
                                key={item.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                  checkedItems.has(item.id)
                                    ? "bg-[#06D6A0]/10 border-[#06D6A0]/30"
                                    : "bg-white/5 border-white/10"
                                }`}
                              >
                                <Checkbox
                                  checked={checkedItems.has(item.id)}
                                  onCheckedChange={() => toggleCheck(item.id)}
                                  className="mt-0.5"
                                />
                                <span className={`text-sm flex-1 ${
                                  checkedItems.has(item.id) ? "text-white/90" : "text-white/70"
                                }`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Completion Message */}
                  {progress === 100 && (
                    <div className="mt-6 p-4 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30 text-center">
                      <Check className="w-8 h-8 text-[#06D6A0] mx-auto mb-2" />
                      <h3 className="text-lg font-semibold text-[#06D6A0] mb-1">
                        Migration Complete!
                      </h3>
                      <p className="text-sm text-white/70">
                        All steps checked off. Your skill should now be running on v{targetVersion}.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compatibility Checker */}
        <TabsContent value="compatibility" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Compatibility Checker</CardTitle>
              <CardDescription>
                Verify your stack is compatible with the skills you want to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Skill Selection */}
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">Skill</label>
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                      <SelectValue placeholder="Select skill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map(skill => (
                        <SelectItem key={skill.slug} value={skill.slug}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Host Selection */}
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">Host</label>
                  <Select value={hostSelection} onValueChange={setHostSelection}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                      <SelectValue placeholder="Select host..." />
                    </SelectTrigger>
                    <SelectContent>
                      {compatibilityMatrix.hosts.map(host => (
                        <SelectItem key={host.name} value={host.name}>
                          {host.name} {host.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Runtime Selection */}
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">Runtime</label>
                  <Select value={runtimeSelection} onValueChange={setRuntimeSelection}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                      <SelectValue placeholder="Select runtime..." />
                    </SelectTrigger>
                    <SelectContent>
                      {compatibilityMatrix.runtimes.map(runtime => (
                        <SelectItem key={runtime.name} value={runtime.name}>
                          {runtime.name} {runtime.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Compatibility Results */}
              {compatibilityResults && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Compatibility Results</h3>
                  
                  {/* Host Compatibility */}
                  <Card className={`${
                    compatibilityResults.hostCompatible 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-red-500/10 border-red-500/30"
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {compatibilityResults.hostCompatible ? (
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className={`font-semibold mb-1 ${
                            compatibilityResults.hostCompatible ? "text-green-400" : "text-red-400"
                          }`}>
                            Host: {hostSelection}
                          </h4>
                          <p className="text-sm text-white/70">
                            {compatibilityResults.hostCompatible 
                              ? "Fully supported" 
                              : "Limited or no support"}
                          </p>
                          {compatibilityResults.hostNote && (
                            <p className="text-xs text-white/60 mt-1">
                              {compatibilityResults.hostNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Runtime & Dependencies */}
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-white/90 mb-2">Runtime</h4>
                        <p className="text-sm text-white/70">{runtimeSelection}</p>
                      </div>

                      {compatibilityResults.runtimeRequired.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white/90 mb-2">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {compatibilityResults.runtimeRequired.map(dep => (
                              <Badge key={dep} variant="outline" className="text-yellow-400 border-yellow-500/30">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {compatibilityResults.optionalDeps.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white/90 mb-2">Optional Dependencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {compatibilityResults.optionalDeps.map(dep => (
                              <Badge key={dep} variant="outline" className="text-blue-400 border-blue-500/30">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {compatibilityResults.conflicts.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-400 mb-2">Conflicts</h4>
                          <div className="flex flex-wrap gap-2">
                            {compatibilityResults.conflicts.map(conflict => (
                              <Badge key={conflict} variant="outline" className="text-red-400 border-red-500/30">
                                {conflict}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-white/60 mt-2">
                            These skills cannot be used together
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {!compatibilityResults && (
                <div className="text-center py-12">
                  <Info className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">Select your stack to check compatibility</p>
                  <p className="text-sm text-white/40">
                    Choose a skill, host, and runtime to see detailed compatibility information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compatibility Matrix */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Full Compatibility Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wider">
                  Supported Hosts
                </h3>
                <div className="space-y-2">
                  {compatibilityMatrix.hosts.map(host => (
                    <div key={host.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <span className="text-white font-medium">{host.name}</span>
                        <span className="text-white/50 ml-2">{host.version}</span>
                      </div>
                      <Badge variant="outline" className={
                        host.supported 
                          ? "text-green-400 border-green-500/30" 
                          : "text-red-400 border-red-500/30"
                      }>
                        {host.supported ? "Supported" : "Not Supported"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wider">
                  Supported Runtimes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {compatibilityMatrix.runtimes.map(runtime => (
                    <Badge key={runtime.name} variant="outline" className="text-white border-white/20">
                      {runtime.name} {runtime.version}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Success Stories */}
        <TabsContent value="stories" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Migration Success Stories</CardTitle>
              <CardDescription>
                Real agents who successfully migrated with measurable improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relevantStories.map(story => (
                  <Card key={story.id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-white mb-2">{story.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {story.agent}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {story.timeframe}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                        >
                          {expandedStory === story.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {expandedStory === story.id && (
                      <CardContent className="space-y-6">
                        {/* Before & After */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <h4 className="text-sm font-semibold text-red-400 mb-3">Before</h4>
                            <p className="text-xs text-white/60 mb-3">{story.before.version}</p>
                            <ul className="space-y-2 mb-4">
                              {story.before.issues.map((issue, idx) => (
                                <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                                  <span className="text-red-400">•</span>
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="space-y-1">
                              {Object.entries(story.before.metrics).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between text-xs">
                                  <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="text-white/80 font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                            <h4 className="text-sm font-semibold text-green-400 mb-3">After</h4>
                            <p className="text-xs text-white/60 mb-3">{story.after.version}</p>
                            <ul className="space-y-2 mb-4">
                              {story.after.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                                  <span className="text-green-400">•</span>
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="space-y-1">
                              {Object.entries(story.after.metrics).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between text-xs">
                                  <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="text-green-400 font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Testimonial */}
                        <div className="p-4 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30">
                          <p className="text-white/80 italic mb-2">&ldquo;{story.testimonial}&rdquo;</p>
                          <p className="text-sm text-[#06D6A0]">— {story.author}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {story.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-white/60 border-white/20">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-purple/10 border-[#06D6A0]/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-12 h-12 text-[#06D6A0] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Share Your Migration Story</h3>
                <p className="text-white/60 mb-6 max-w-2xl mx-auto">
                  Did you successfully migrate a skill? Share your experience to help other agents.
                </p>
                <Button asChild className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110">
                  <Link href="/submit">Submit Your Story</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
