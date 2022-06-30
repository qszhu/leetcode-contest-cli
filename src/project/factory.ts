import Project from "."
import { Language } from "../types"
import Cpp from "./Cpp"
import Go from "./Go"
import Java from "./Java"
import JavaScript from "./JavaScript"
import Kotlin from "./Kotlin"
import Python from "./Python"
import Rust from "./Rust"
import TypeScript from "./TypeScript"

const rootDir = 'contests'
const libDir = 'lib'

export default class ProjectFactory {
  static getProject(lang: string, contestId: string, problemId: string): Project {
    switch (lang) {
      case Language.JavaScript: return new JavaScript(rootDir, libDir, contestId, problemId)
      case Language.TypeScript: return new TypeScript(rootDir, libDir, contestId, problemId)
      case Language.Python: return new Python(rootDir, libDir, contestId, problemId)
      case Language.Cpp: return new Cpp(rootDir, libDir, contestId, problemId)
      case Language.Go: return new Go(rootDir, libDir, contestId, problemId)
      case Language.Rust: return new Rust(rootDir, libDir, contestId, problemId)
      case Language.Kotlin: return new Kotlin(rootDir, libDir, contestId, problemId)
      case Language.Java: return new Java(rootDir, libDir, contestId, problemId)
      default: throw new Error(`Unsupported language: ${lang}`)
    }
  }

  static supportedLanguages() {
    return [
      { name: 'JavaScript', value: Language.JavaScript },
      { name: 'TypeScript', value: Language.TypeScript },
      { name: 'Python', value: Language.Python },
      { name: 'C++', value: Language.Cpp },
      { name: 'Go', value: Language.Go },
      { name: 'Rust', value: Language.Rust },
      { name: 'Kotlin', value: Language.Kotlin },
      { name: 'Java', value: Language.Java }
    ]
  }
}
