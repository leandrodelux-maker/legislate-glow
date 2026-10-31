export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      transparencia_sincronizacoes: {
        Row: {
          ano: number
          concluido_em: string | null
          dataset: string
          erro: string | null
          id: number
          iniciado_em: string
          status: string
          total_gravado: number | null
          total_portal: number | null
        }
        Insert: {
          ano: number
          concluido_em?: string | null
          dataset: string
          erro?: string | null
          iniciado_em?: string
          status: string
          total_gravado?: number | null
          total_portal?: number | null
        }
        Update: {
          ano?: number
          concluido_em?: string | null
          dataset?: string
          erro?: string | null
          iniciado_em?: string
          status?: string
          total_gravado?: number | null
          total_portal?: number | null
        }
        Relationships: []
      }
      admin_usuarios: {
        Row: {
          ativo: boolean
          criado_em: string
          email: string
          nome: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          email: string
          nome?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          email?: string
          nome?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atricon_itens: {
        Row: {
          ativo: boolean
          base_legal: string | null
          created_at: string
          grupo: string
          grupo_ordem: number
          id: string
          link: string | null
          numero: string
          ordem: number
          pergunta: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          base_legal?: string | null
          created_at?: string
          grupo: string
          grupo_ordem?: number
          id?: string
          link?: string | null
          numero: string
          ordem?: number
          pergunta: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          base_legal?: string | null
          created_at?: string
          grupo?: string
          grupo_ordem?: number
          id?: string
          link?: string | null
          numero?: string
          ordem?: number
          pergunta?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          id: string
          registro_id: string | null
          tabela: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          registro_id?: string | null
          tabela?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          registro_id?: string | null
          tabela?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      avisos: {
        Row: {
          anexos: string[] | null
          ativo: boolean | null
          categoria: string | null
          conteudo: string | null
          created_at: string
          data_publicacao: string | null
          destaque: boolean | null
          documento_url: string | null
          id: string
          imagem_url: string | null
          prazo: string | null
          secretaria: string | null
          tipo: string
          titulo: string
          updated_at: string
          urgente: boolean | null
        }
        Insert: {
          anexos?: string[] | null
          ativo?: boolean | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string | null
          destaque?: boolean | null
          documento_url?: string | null
          id?: string
          imagem_url?: string | null
          prazo?: string | null
          secretaria?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          urgente?: boolean | null
        }
        Update: {
          anexos?: string[] | null
          ativo?: boolean | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string | null
          destaque?: boolean | null
          documento_url?: string | null
          id?: string
          imagem_url?: string | null
          prazo?: string | null
          secretaria?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          urgente?: boolean | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          ativo: boolean | null
          created_at: string
          cta_texto: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          imagem_url: string | null
          link: string | null
          ordem: number | null
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          cta_texto?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number | null
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          cta_texto?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number | null
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      certidoes_publicacao: {
        Row: {
          arquivo_url: string | null
          cidade_uf: string | null
          created_at: string
          diario_id: string
          gerado_por: string | null
          gerado_por_email: string | null
          hash_validacao: string
          id: string
          municipio: string | null
          numero_certidao: string
          responsavel_cargo: string | null
          responsavel_nome: string | null
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          cidade_uf?: string | null
          created_at?: string
          diario_id: string
          gerado_por?: string | null
          gerado_por_email?: string | null
          hash_validacao: string
          id?: string
          municipio?: string | null
          numero_certidao: string
          responsavel_cargo?: string | null
          responsavel_nome?: string | null
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          cidade_uf?: string | null
          created_at?: string
          diario_id?: string
          gerado_por?: string | null
          gerado_por_email?: string | null
          hash_validacao?: string
          id?: string
          municipio?: string | null
          numero_certidao?: string
          responsavel_cargo?: string | null
          responsavel_nome?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certidoes_publicacao_diario_id_fkey"
            columns: ["diario_id"]
            isOneToOne: false
            referencedRelation: "diario_oficial"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          id: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string
          valor?: Json
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      contatos: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          email: string | null
          endereco: string | null
          id: string
          ordem: number | null
          secretaria_id: string | null
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          ordem?: number | null
          secretaria_id?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          ordem?: number | null
          secretaria_id?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          ativo: boolean | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          ordem: number | null
          responsavel: string | null
          secretaria_id: string | null
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          ordem?: number | null
          responsavel?: string | null
          secretaria_id?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          responsavel?: string | null
          secretaria_id?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departamentos_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_oficial: {
        Row: {
          anexos: string[] | null
          arquivo_url: string | null
          ativo: boolean
          conteudo: string | null
          created_at: string
          data_publicacao: string
          descricao: string | null
          id: string
          numero: string
          orgao: string | null
          responsavel: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          anexos?: string[] | null
          arquivo_url?: string | null
          ativo?: boolean
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string
          descricao?: string | null
          id?: string
          numero: string
          orgao?: string | null
          responsavel?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          anexos?: string[] | null
          arquivo_url?: string | null
          ativo?: boolean
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string
          descricao?: string | null
          id?: string
          numero?: string
          orgao?: string | null
          responsavel?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      dirigentes: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string
          foto_url: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          ano: number | null
          arquivo_url: string | null
          ativo: boolean | null
          categoria: string | null
          created_at: string
          data_publicacao: string | null
          descricao: string | null
          formato: string | null
          id: string
          secretaria: string | null
          tamanho: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ano?: number | null
          arquivo_url?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          formato?: string | null
          id?: string
          secretaria?: string | null
          tamanho?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ano?: number | null
          arquivo_url?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          formato?: string | null
          id?: string
          secretaria?: string | null
          tamanho?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      executivo_municipal: {
        Row: {
          ativo: boolean | null
          biografia: string | null
          cargo: string
          competencias: string | null
          compromissos: string[] | null
          created_at: string
          email: string | null
          endereco: string | null
          foto_url: string | null
          horario: string | null
          id: string
          mandato: string | null
          nome: string
          ordem: number | null
          orgao: string | null
          principios: string[] | null
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          biografia?: string | null
          cargo?: string
          competencias?: string | null
          compromissos?: string[] | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          horario?: string | null
          id?: string
          mandato?: string | null
          nome: string
          ordem?: number | null
          orgao?: string | null
          principios?: string[] | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          biografia?: string | null
          cargo?: string
          competencias?: string | null
          compromissos?: string[] | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          horario?: string | null
          id?: string
          mandato?: string | null
          nome?: string
          ordem?: number | null
          orgao?: string | null
          principios?: string[] | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      galeria: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string
          data: string | null
          id: string
          imagens: string[] | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          data?: string | null
          id?: string
          imagens?: string[] | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          data?: string | null
          id?: string
          imagens?: string[] | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      membros_equipe: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string
          departamento_id: string | null
          email: string | null
          foto_url: string | null
          id: string
          nome: string
          ordem: number | null
          secretaria_id: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string
          departamento_id?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number | null
          secretaria_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string
          departamento_id?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          secretaria_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_equipe_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_equipe_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          ativo: boolean | null
          created_at: string
          externo: boolean | null
          id: string
          label: string
          ordem: number | null
          parent_id: string | null
          tipo: string | null
          url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          externo?: boolean | null
          id?: string
          label: string
          ordem?: number | null
          parent_id?: string | null
          tipo?: string | null
          url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          externo?: boolean | null
          id?: string
          label?: string
          ordem?: number | null
          parent_id?: string | null
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias: {
        Row: {
          ativo: boolean | null
          autor: string | null
          categoria: string | null
          conteudo: string | null
          created_at: string
          data_publicacao: string | null
          destaque: boolean | null
          galeria: string[] | null
          id: string
          imagem_url: string | null
          meta_description: string | null
          meta_title: string | null
          resumo: string | null
          secretaria: string | null
          subtitulo: string | null
          tags: string[] | null
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string | null
          destaque?: boolean | null
          galeria?: string[] | null
          id?: string
          imagem_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          resumo?: string | null
          secretaria?: string | null
          subtitulo?: string | null
          tags?: string[] | null
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string | null
          destaque?: boolean | null
          galeria?: string[] | null
          id?: string
          imagem_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          resumo?: string | null
          secretaria?: string | null
          subtitulo?: string | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      ouvidoria: {
        Row: {
          prazo_resposta: string | null
          prorrogado_em: string | null
          prorrogacao_justificativa: string | null
          categoria: string | null
          contato: string | null
          created_at: string
          descricao: string
          email: string | null
          id: string
          nome: string | null
          protocolo: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          secretaria: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          prazo_resposta?: string | null
          prorrogado_em?: string | null
          prorrogacao_justificativa?: string | null
          categoria?: string | null
          contato?: string | null
          created_at?: string
          descricao: string
          email?: string | null
          id?: string
          nome?: string | null
          protocolo?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          secretaria?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          prazo_resposta?: string | null
          prorrogado_em?: string | null
          prorrogacao_justificativa?: string | null
          categoria?: string | null
          contato?: string | null
          created_at?: string
          descricao?: string
          email?: string | null
          id?: string
          nome?: string | null
          protocolo?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          secretaria?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      paginas: {
        Row: {
          ativo: boolean | null
          conteudo: string | null
          created_at: string
          id: string
          meta_description: string | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      planejamento_documentos: {
        Row: {
          arquivo_url: string | null
          arquivos_nomes: string[]
          arquivos_urls: string[]
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          arquivos_nomes?: string[]
          arquivos_urls?: string[]
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          arquivos_nomes?: string[]
          arquivos_urls?: string[]
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      pnab_documentos: {
        Row: {
          arquivo_url: string | null
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      portal_services: {
        Row: {
          active: boolean | null
          badge: string | null
          badge_bg_color: string | null
          badge_color: string | null
          category_id: string | null
          category_name: string | null
          click_count: number | null
          created_at: string
          description: string | null
          icon: string | null
          icon_bg_color: string | null
          icon_color: string | null
          id: string
          link: string | null
          link_externo: boolean
          order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          badge?: string | null
          badge_bg_color?: string | null
          badge_color?: string | null
          category_id?: string | null
          category_name?: string | null
          click_count?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          icon_bg_color?: string | null
          icon_color?: string | null
          id?: string
          link?: string | null
          link_externo?: boolean
          order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          badge?: string | null
          badge_bg_color?: string | null
          badge_color?: string | null
          category_id?: string | null
          category_name?: string | null
          click_count?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          icon_bg_color?: string | null
          icon_color?: string | null
          id?: string
          link?: string | null
          link_externo?: boolean
          order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          display_name: string | null
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relatorios_fiscais_documentos: {
        Row: {
          arquivo_url: string | null
          arquivos_nomes: string[]
          arquivos_urls: string[] | null
          ativo: boolean
          created_at: string
          exercicio: number
          id: string
          ordem: number
          periodo: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          arquivos_nomes?: string[]
          arquivos_urls?: string[] | null
          ativo?: boolean
          created_at?: string
          exercicio?: number
          id?: string
          ordem?: number
          periodo?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          arquivos_nomes?: string[]
          arquivos_urls?: string[] | null
          ativo?: boolean
          created_at?: string
          exercicio?: number
          id?: string
          ordem?: number
          periodo?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          criar: boolean
          editar: boolean
          excluir: boolean
          id: string
          modulo: string
          publicar: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          visualizar: boolean
        }
        Insert: {
          created_at?: string
          criar?: boolean
          editar?: boolean
          excluir?: boolean
          id?: string
          modulo: string
          publicar?: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          visualizar?: boolean
        }
        Update: {
          created_at?: string
          criar?: boolean
          editar?: boolean
          excluir?: boolean
          id?: string
          modulo?: string
          publicar?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          visualizar?: boolean
        }
        Relationships: []
      }
      saude_documentos: {
        Row: {
          arquivo_url: string | null
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          link_url: string | null
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          link_url?: string | null
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          link_url?: string | null
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      secretarias: {
        Row: {
          ativo: boolean | null
          competencias: string[] | null
          created_at: string
          descricao: string | null
          email: string | null
          endereco: string | null
          foto_secretario: string | null
          horario: string | null
          id: string
          imagem_url: string | null
          nome: string
          secretario: string | null
          servicos: string[] | null
          sigla: string | null
          slug: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          competencias?: string[] | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          foto_secretario?: string | null
          horario?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          secretario?: string | null
          servicos?: string[] | null
          sigla?: string | null
          slug: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          competencias?: string[] | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          foto_secretario?: string | null
          horario?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          secretario?: string | null
          servicos?: string[] | null
          sigla?: string | null
          slug?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
          order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
          order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean | null
          canal: string | null
          categoria: string | null
          created_at: string
          descricao: string | null
          documentos_necessarios: string[] | null
          id: string
          link_digital: string | null
          local_atendimento: string | null
          nome: string
          ordem: number
          prazo: string | null
          publico_alvo: string | null
          secretaria: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          canal?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          documentos_necessarios?: string[] | null
          id?: string
          link_digital?: string | null
          local_atendimento?: string | null
          nome: string
          ordem?: number
          prazo?: string | null
          publico_alvo?: string | null
          secretaria?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          canal?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          documentos_necessarios?: string[] | null
          id?: string
          link_digital?: string | null
          local_atendimento?: string | null
          nome?: string
          ordem?: number
          prazo?: string | null
          publico_alvo?: string | null
          secretaria?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sic_pedidos: {
        Row: {
          prorrogado_em: string | null
          prorrogacao_justificativa: string | null
          recurso_texto: string | null
          recurso_em: string | null
          recurso_prazo: string | null
          recurso_status: string | null
          recurso_resposta: string | null
          recurso_respondido_em: string | null
          recurso_respondido_por: string | null
          anexos: string[] | null
          assunto: string
          created_at: string
          descricao: string
          email: string
          id: string
          nome: string
          prazo_resposta: string | null
          protocolo: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          prorrogado_em?: string | null
          prorrogacao_justificativa?: string | null
          recurso_texto?: string | null
          recurso_em?: string | null
          recurso_prazo?: string | null
          recurso_status?: string | null
          recurso_resposta?: string | null
          recurso_respondido_em?: string | null
          recurso_respondido_por?: string | null
          anexos?: string[] | null
          assunto: string
          created_at?: string
          descricao: string
          email: string
          id?: string
          nome: string
          prazo_resposta?: string | null
          protocolo?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          prorrogado_em?: string | null
          prorrogacao_justificativa?: string | null
          recurso_texto?: string | null
          recurso_em?: string | null
          recurso_prazo?: string | null
          recurso_status?: string | null
          recurso_resposta?: string | null
          recurso_respondido_em?: string | null
          recurso_respondido_por?: string | null
          anexos?: string[] | null
          assunto?: string
          created_at?: string
          descricao?: string
          email?: string
          id?: string
          nome?: string
          prazo_resposta?: string | null
          protocolo?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transparencia_destaques: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          link: string | null
          posicao: number | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          link?: string | null
          posicao?: number | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          link?: string | null
          posicao?: number | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      transparencia_menu_grupos: {
        Row: {
          ativo: boolean
          cor: string
          created_at: string
          icone: string
          id: string
          label: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor?: string
          created_at?: string
          icone?: string
          id?: string
          label: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor?: string
          created_at?: string
          icone?: string
          id?: string
          label?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      transparencia_menu_links: {
        Row: {
          ativo: boolean
          created_at: string
          grupo_id: string
          href: string
          id: string
          label: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          grupo_id: string
          href: string
          id?: string
          label: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          grupo_id?: string
          href?: string
          id?: string
          label?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transparencia_menu_links_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "transparencia_menu_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      certidoes_validacao: {
        Row: {
          arquivo_url: string | null
          cidade_uf: string | null
          created_at: string | null
          diario_id: string | null
          hash_validacao: string | null
          municipio: string | null
          numero_certidao: string | null
        }
        Insert: {
          arquivo_url?: string | null
          cidade_uf?: string | null
          created_at?: string | null
          diario_id?: string | null
          hash_validacao?: string | null
          municipio?: string | null
          numero_certidao?: string | null
        }
        Update: {
          arquivo_url?: string | null
          cidade_uf?: string | null
          created_at?: string | null
          diario_id?: string | null
          hash_validacao?: string | null
          municipio?: string | null
          numero_certidao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certidoes_publicacao_diario_id_fkey"
            columns: ["diario_id"]
            isOneToOne: false
            referencedRelation: "diario_oficial"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "viewer"
        | "servidor"
        | "secretaria"
        | "ouvidoria"
        | "transparencia"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "editor",
        "viewer",
        "servidor",
        "secretaria",
        "ouvidoria",
        "transparencia",
      ],
    },
  },
} as const
