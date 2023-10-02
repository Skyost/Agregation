import { ParsedContent } from '@nuxt/content/dist/runtime/types'
import type { LatexContentObject } from '~/types/latex.d'

export interface Lesson extends LatexContentObject {}

export interface LessonContent extends Lesson, ParsedContent {}
