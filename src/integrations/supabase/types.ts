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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      acesso_rapido: {
        Row: {
          ativo: boolean
          created_at: string
          icon: string
          id: string
          label: string
          ordem: number
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          icon?: string
          id?: string
          label: string
          ordem?: number
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          icon?: string
          id?: string
          label?: string
          ordem?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read_by: string[]
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read_by?: string[]
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read_by?: string[]
          title?: string
          type?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          ativo: boolean
          created_at: string
          fim_em: string | null
          id: string
          imagem_url: string
          inicio_em: string | null
          link_url: string | null
          ordem: number
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          fim_em?: string | null
          id?: string
          imagem_url: string
          inicio_em?: string | null
          link_url?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          fim_em?: string | null
          id?: string
          imagem_url?: string
          inicio_em?: string | null
          link_url?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      comissoes: {
        Row: {
          ativo: boolean
          competencia: string | null
          created_at: string
          icone: string | null
          id: string
          nome: string
          ordem: number
          sigla: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          competencia?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          sigla: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          competencia?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          sigla?: string
          updated_at?: string
        }
        Relationships: []
      }
      comissoes_membros: {
        Row: {
          comissao_id: string
          created_at: string
          funcao: string
          id: string
          nome: string
          ordem: number
          updated_at: string
          vereador_id: string | null
        }
        Insert: {
          comissao_id: string
          created_at?: string
          funcao: string
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
          vereador_id?: string | null
        }
        Update: {
          comissao_id?: string
          created_at?: string
          funcao?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          vereador_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_membros_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_membros_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_membros_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_oficial: {
        Row: {
          conteudo: string | null
          created_at: string
          data_publicacao: string
          id: string
          numero_edicao: string
          pdf_url: string | null
          publicado: boolean
          resumo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          data_publicacao: string
          id?: string
          numero_edicao: string
          pdf_url?: string | null
          publicado?: boolean
          resumo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string
          id?: string
          numero_edicao?: string
          pdf_url?: string | null
          publicado?: boolean
          resumo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      documentos_oficiais: {
        Row: {
          categoria: string
          created_at: string
          data_documento: string | null
          descricao: string | null
          download_url: string
          id: string
          ordem: number
          publicado: boolean
          titulo: string
          updated_at: string
          viewer_url: string | null
        }
        Insert: {
          categoria: string
          created_at?: string
          data_documento?: string | null
          descricao?: string | null
          download_url: string
          id?: string
          ordem?: number
          publicado?: boolean
          titulo: string
          updated_at?: string
          viewer_url?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string
          data_documento?: string | null
          descricao?: string | null
          download_url?: string
          id?: string
          ordem?: number
          publicado?: boolean
          titulo?: string
          updated_at?: string
          viewer_url?: string | null
        }
        Relationships: []
      }
      esic_solicitacoes: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          id: string
          nome: string
          pedido: string
          prazo_resposta: string
          protocolo: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          pedido: string
          prazo_resposta?: string
          protocolo?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          pedido?: string
          prazo_resposta?: string
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
      faq: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string | null
          id: string
          ordem: number
          pergunta: string
          resposta: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string | null
          id?: string
          ordem?: number
          pergunta: string
          resposta: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string | null
          id?: string
          ordem?: number
          pergunta?: string
          resposta?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      galeria_albuns: {
        Row: {
          capa_url: string | null
          created_at: string
          descricao: string | null
          evento_data: string | null
          id: string
          publicado: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          capa_url?: string | null
          created_at?: string
          descricao?: string | null
          evento_data?: string | null
          id?: string
          publicado?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          capa_url?: string | null
          created_at?: string
          descricao?: string | null
          evento_data?: string | null
          id?: string
          publicado?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      galeria_itens: {
        Row: {
          album_id: string | null
          created_at: string
          id: string
          legenda: string | null
          ordem: number
          thumbnail_url: string | null
          tipo: string
          url: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string
          id?: string
          legenda?: string | null
          ordem?: number
          thumbnail_url?: string | null
          tipo?: string
          url: string
        }
        Update: {
          album_id?: string | null
          created_at?: string
          id?: string
          legenda?: string | null
          ordem?: number
          thumbnail_url?: string | null
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "galeria_itens_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "galeria_albuns"
            referencedColumns: ["id"]
          },
        ]
      }
      mesa_diretora: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string
          id: string
          ordem: number | null
          updated_at: string
          vereador_id: string
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string
          id?: string
          ordem?: number | null
          updated_at?: string
          vereador_id: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string
          id?: string
          ordem?: number | null
          updated_at?: string
          vereador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mesa_diretora_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesa_diretora_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias: {
        Row: {
          agendado_para: string | null
          autor: string | null
          categoria: string | null
          categoria_id: string | null
          conteudo: string
          created_at: string
          destaque: boolean
          id: string
          imagem_url: string | null
          publicado: boolean
          publicado_em: string | null
          resumo: string | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          agendado_para?: string | null
          autor?: string | null
          categoria?: string | null
          categoria_id?: string | null
          conteudo: string
          created_at?: string
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          publicado?: boolean
          publicado_em?: string | null
          resumo?: string | null
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          agendado_para?: string | null
          autor?: string | null
          categoria?: string | null
          categoria_id?: string | null
          conteudo?: string
          created_at?: string
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          publicado?: boolean
          publicado_em?: string | null
          resumo?: string | null
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "noticias_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias_categorias: {
        Row: {
          cor: string | null
          created_at: string
          id: string
          nome: string
          ordem: number
          slug: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          slug: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      ouvidoria_protocolos: {
        Row: {
          assunto: string
          created_at: string
          email: string | null
          id: string
          mensagem: string
          nome: string
          protocolo: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          status: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          assunto: string
          created_at?: string
          email?: string | null
          id?: string
          mensagem: string
          nome: string
          protocolo?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          created_at?: string
          email?: string | null
          id?: string
          mensagem?: string
          nome?: string
          protocolo?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      paginas: {
        Row: {
          created_at: string
          id: string
          meta_descricao: string | null
          ordem: number
          publicado: boolean
          slug: string
          template: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_descricao?: string | null
          ordem?: number
          publicado?: boolean
          slug: string
          template?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_descricao?: string | null
          ordem?: number
          publicado?: boolean
          slug?: string
          template?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      paginas_blocos: {
        Row: {
          conteudo: Json
          created_at: string
          id: string
          ordem: number
          pagina_id: string
          tipo: string
          updated_at: string
        }
        Insert: {
          conteudo?: Json
          created_at?: string
          id?: string
          ordem?: number
          pagina_id: string
          tipo: string
          updated_at?: string
        }
        Update: {
          conteudo?: Json
          created_at?: string
          id?: string
          ordem?: number
          pagina_id?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paginas_blocos_pagina_id_fkey"
            columns: ["pagina_id"]
            isOneToOne: false
            referencedRelation: "paginas"
            referencedColumns: ["id"]
          },
        ]
      }
      popups: {
        Row: {
          ativo: boolean
          created_at: string
          fim_em: string | null
          id: string
          imagem_url: string | null
          inicio_em: string | null
          link_url: string | null
          mensagem: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          fim_em?: string | null
          id?: string
          imagem_url?: string | null
          inicio_em?: string | null
          link_url?: string | null
          mensagem?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          fim_em?: string | null
          id?: string
          imagem_url?: string | null
          inicio_em?: string | null
          link_url?: string | null
          mensagem?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projetos_legislativos: {
        Row: {
          ano: number
          autor: string | null
          autor_id: string | null
          created_at: string
          data_apresentacao: string | null
          documento_url: string | null
          ementa: string
          id: string
          numero: string
          observacoes: string | null
          status: string
          tipo: string
          tramitacao: string | null
          updated_at: string
        }
        Insert: {
          ano: number
          autor?: string | null
          autor_id?: string | null
          created_at?: string
          data_apresentacao?: string | null
          documento_url?: string | null
          ementa: string
          id?: string
          numero: string
          observacoes?: string | null
          status?: string
          tipo: string
          tramitacao?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number
          autor?: string | null
          autor_id?: string | null
          created_at?: string
          data_apresentacao?: string | null
          documento_url?: string | null
          ementa?: string
          id?: string
          numero?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          tramitacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_legislativos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_legislativos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "vereadores_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      roteiro_sessoes: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string
          icone: string | null
          id: string
          nota_quorum: string | null
          numero_etapa: string
          ordem: number
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao: string
          icone?: string | null
          id?: string
          nota_quorum?: string | null
          numero_etapa: string
          ordem?: number
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string
          icone?: string | null
          id?: string
          nota_quorum?: string | null
          numero_etapa?: string
          ordem?: number
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sessoes: {
        Row: {
          ata_publicada: boolean | null
          ata_url: string | null
          created_at: string
          data_sessao: string
          id: string
          lista_presenca_url: string | null
          local: string | null
          pauta: string | null
          qtd_pautas: number | null
          qtd_presencas: number | null
          qtd_votacoes: number | null
          resumo_votos_url: string | null
          status: string
          tipo: string | null
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ata_publicada?: boolean | null
          ata_url?: string | null
          created_at?: string
          data_sessao: string
          id?: string
          lista_presenca_url?: string | null
          local?: string | null
          pauta?: string | null
          qtd_pautas?: number | null
          qtd_presencas?: number | null
          qtd_votacoes?: number | null
          resumo_votos_url?: string | null
          status?: string
          tipo?: string | null
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ata_publicada?: boolean | null
          ata_url?: string | null
          created_at?: string
          data_sessao?: string
          id?: string
          lista_presenca_url?: string | null
          local?: string | null
          pauta?: string | null
          qtd_pautas?: number | null
          qtd_presencas?: number | null
          qtd_votacoes?: number | null
          resumo_votos_url?: string | null
          status?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      sessoes_presencas: {
        Row: {
          created_at: string | null
          id: string
          presente: boolean | null
          sessao_id: string
          vereador_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          presente?: boolean | null
          sessao_id: string
          vereador_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          presente?: boolean | null
          sessao_id?: string
          vereador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_presencas_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_presencas_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_presencas_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_votacoes: {
        Row: {
          created_at: string | null
          id: string
          materia_id: string | null
          sessao_id: string
          vereador_id: string
          voto: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          materia_id?: string | null
          sessao_id: string
          vereador_id: string
          voto?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          materia_id?: string | null
          sessao_id?: string
          vereador_id?: string
          voto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_votacoes_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "projetos_legislativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_votacoes_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_votacoes_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_votacoes_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      site_menus: {
        Row: {
          abrir_nova_aba: boolean
          ativo: boolean
          created_at: string
          icone: string | null
          id: string
          label: string
          ordem: number
          parent_id: string | null
          updated_at: string
          url: string
        }
        Insert: {
          abrir_nova_aba?: boolean
          ativo?: boolean
          created_at?: string
          icone?: string | null
          id?: string
          label: string
          ordem?: number
          parent_id?: string | null
          updated_at?: string
          url?: string
        }
        Update: {
          abrir_nova_aba?: boolean
          ativo?: boolean
          created_at?: string
          icone?: string | null
          id?: string
          label?: string
          ordem?: number
          parent_id?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_menus_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          brasao_url: string | null
          contact_email: string | null
          contact_hours: string | null
          contact_phone: string | null
          cookies_enabled: boolean | null
          cookies_text: string | null
          cor_botoes: string | null
          cor_cards: string | null
          cor_destaque: string | null
          cor_menu: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string
          endereco: string | null
          favicon_url: string | null
          fonte_corpo: string | null
          fonte_titulo: string | null
          footer_logo_height: number | null
          footer_logo_url: string | null
          footer_text: string | null
          google_analytics_id: string | null
          gtm_id: string | null
          header_logo_height: number | null
          header_logo_url: string | null
          hero_botao_texto: string | null
          hero_botao_url: string | null
          hero_eyebrow: string
          hero_media_type: string
          hero_media_url: string | null
          hero_subtitle: string
          hero_title: string
          id: string
          live_broadcast_url: string | null
          logo_claro_url: string | null
          logo_escuro_url: string | null
          nome_camara: string | null
          og_image_url: string | null
          ordem_blocos: Json | null
          plenario_image_url: string | null
          privacy_policy: string | null
          redes_sociais: Json | null
          seo_description: string | null
          seo_title: string | null
          terms_of_use: string | null
          transparencia_ativa_enabled: boolean
          transparencia_ativa_intro: string | null
          transparencia_portal_button_label: string | null
          transparencia_portal_url: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          brasao_url?: string | null
          contact_email?: string | null
          contact_hours?: string | null
          contact_phone?: string | null
          cookies_enabled?: boolean | null
          cookies_text?: string | null
          cor_botoes?: string | null
          cor_cards?: string | null
          cor_destaque?: string | null
          cor_menu?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          endereco?: string | null
          favicon_url?: string | null
          fonte_corpo?: string | null
          fonte_titulo?: string | null
          footer_logo_height?: number | null
          footer_logo_url?: string | null
          footer_text?: string | null
          google_analytics_id?: string | null
          gtm_id?: string | null
          header_logo_height?: number | null
          header_logo_url?: string | null
          hero_botao_texto?: string | null
          hero_botao_url?: string | null
          hero_eyebrow?: string
          hero_media_type?: string
          hero_media_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          live_broadcast_url?: string | null
          logo_claro_url?: string | null
          logo_escuro_url?: string | null
          nome_camara?: string | null
          og_image_url?: string | null
          ordem_blocos?: Json | null
          plenario_image_url?: string | null
          privacy_policy?: string | null
          redes_sociais?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          terms_of_use?: string | null
          transparencia_ativa_enabled?: boolean
          transparencia_ativa_intro?: string | null
          transparencia_portal_button_label?: string | null
          transparencia_portal_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          brasao_url?: string | null
          contact_email?: string | null
          contact_hours?: string | null
          contact_phone?: string | null
          cookies_enabled?: boolean | null
          cookies_text?: string | null
          cor_botoes?: string | null
          cor_cards?: string | null
          cor_destaque?: string | null
          cor_menu?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          endereco?: string | null
          favicon_url?: string | null
          fonte_corpo?: string | null
          fonte_titulo?: string | null
          footer_logo_height?: number | null
          footer_logo_url?: string | null
          footer_text?: string | null
          google_analytics_id?: string | null
          gtm_id?: string | null
          header_logo_height?: number | null
          header_logo_url?: string | null
          hero_botao_texto?: string | null
          hero_botao_url?: string | null
          hero_eyebrow?: string
          hero_media_type?: string
          hero_media_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          live_broadcast_url?: string | null
          logo_claro_url?: string | null
          logo_escuro_url?: string | null
          nome_camara?: string | null
          og_image_url?: string | null
          ordem_blocos?: Json | null
          plenario_image_url?: string | null
          privacy_policy?: string | null
          redes_sociais?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          terms_of_use?: string | null
          transparencia_ativa_enabled?: boolean
          transparencia_ativa_intro?: string | null
          transparencia_portal_button_label?: string | null
          transparencia_portal_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      transparencia_contratos: {
        Row: {
          contratado: string
          created_at: string
          data_assinatura: string | null
          data_vigencia_fim: string | null
          documento_url: string | null
          id: string
          numero: string
          objeto: string
          publicado: boolean
          updated_at: string
          valor: number | null
        }
        Insert: {
          contratado: string
          created_at?: string
          data_assinatura?: string | null
          data_vigencia_fim?: string | null
          documento_url?: string | null
          id?: string
          numero: string
          objeto: string
          publicado?: boolean
          updated_at?: string
          valor?: number | null
        }
        Update: {
          contratado?: string
          created_at?: string
          data_assinatura?: string | null
          data_vigencia_fim?: string | null
          documento_url?: string | null
          id?: string
          numero?: string
          objeto?: string
          publicado?: boolean
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      transparencia_documentos: {
        Row: {
          ano: number | null
          arquivo_url: string | null
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          mes: number | null
          publicado: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          ano?: number | null
          arquivo_url?: string | null
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          mes?: number | null
          publicado?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          ano?: number | null
          arquivo_url?: string | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          mes?: number | null
          publicado?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      transparencia_folha: {
        Row: {
          cargo: string
          created_at: string
          descontos: number | null
          id: string
          mes_referencia: string
          publicado: boolean
          remuneracao_bruta: number | null
          remuneracao_liquida: number | null
          servidor: string
          updated_at: string
          vinculo: string | null
        }
        Insert: {
          cargo: string
          created_at?: string
          descontos?: number | null
          id?: string
          mes_referencia: string
          publicado?: boolean
          remuneracao_bruta?: number | null
          remuneracao_liquida?: number | null
          servidor: string
          updated_at?: string
          vinculo?: string | null
        }
        Update: {
          cargo?: string
          created_at?: string
          descontos?: number | null
          id?: string
          mes_referencia?: string
          publicado?: boolean
          remuneracao_bruta?: number | null
          remuneracao_liquida?: number | null
          servidor?: string
          updated_at?: string
          vinculo?: string | null
        }
        Relationships: []
      }
      transparencia_licitacoes: {
        Row: {
          created_at: string
          data_abertura: string | null
          edital_url: string | null
          id: string
          modalidade: string
          numero: string
          objeto: string
          publicado: boolean
          status: string
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          created_at?: string
          data_abertura?: string | null
          edital_url?: string | null
          id?: string
          modalidade: string
          numero: string
          objeto: string
          publicado?: boolean
          status?: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          created_at?: string
          data_abertura?: string | null
          edital_url?: string | null
          id?: string
          modalidade?: string
          numero?: string
          objeto?: string
          publicado?: boolean
          status?: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: []
      }
      transparencia_modulos: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      transparencia_prestacao_contas: {
        Row: {
          created_at: string
          descricao: string | null
          documento_url: string | null
          exercicio: number | null
          id: string
          periodo: string
          publicado: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          documento_url?: string | null
          exercicio?: number | null
          id?: string
          periodo: string
          publicado?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          documento_url?: string | null
          exercicio?: number | null
          id?: string
          periodo?: string
          publicado?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      transparency_links: {
        Row: {
          category: string
          created_at: string
          description: string
          external_url: string | null
          icon: string
          id: string
          is_active: boolean
          path: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          external_url?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          path?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          external_url?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          path?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transparency_modules: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          link_url: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          link_url: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          link_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transparency_settings: {
        Row: {
          created_at: string
          entity_name: string
          id: string
          intro_text: string | null
          is_active: boolean
          last_sync_at: string | null
          portal_base_url: string
          portal_name: string
          portal_url: string
          show_full_portal_embed: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_name?: string
          id?: string
          intro_text?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          portal_base_url?: string
          portal_name?: string
          portal_url: string
          show_full_portal_embed?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_name?: string
          id?: string
          intro_text?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          portal_base_url?: string
          portal_name?: string
          portal_url?: string
          show_full_portal_embed?: boolean
          updated_at?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      vereadores: {
        Row: {
          ativo: boolean
          biografia: string | null
          cargo: string | null
          comissoes: string | null
          created_at: string
          data_nascimento: string | null
          data_posse: string | null
          email: string | null
          escolaridade: string | null
          foto_url: string | null
          gabinete: string | null
          id: string
          legislatura: string | null
          mandato_atual: string | null
          mandato_fim: string | null
          mandato_inicio: string | null
          naturalidade: string | null
          nome: string
          ordem: number | null
          partido: string | null
          profissao: string | null
          redes_sociais: Json | null
          slug: string | null
          stats: Json | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          biografia?: string | null
          cargo?: string | null
          comissoes?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_posse?: string | null
          email?: string | null
          escolaridade?: string | null
          foto_url?: string | null
          gabinete?: string | null
          id?: string
          legislatura?: string | null
          mandato_atual?: string | null
          mandato_fim?: string | null
          mandato_inicio?: string | null
          naturalidade?: string | null
          nome: string
          ordem?: number | null
          partido?: string | null
          profissao?: string | null
          redes_sociais?: Json | null
          slug?: string | null
          stats?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          biografia?: string | null
          cargo?: string | null
          comissoes?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_posse?: string | null
          email?: string | null
          escolaridade?: string | null
          foto_url?: string | null
          gabinete?: string | null
          id?: string
          legislatura?: string | null
          mandato_atual?: string | null
          mandato_fim?: string | null
          mandato_inicio?: string | null
          naturalidade?: string | null
          nome?: string
          ordem?: number | null
          partido?: string | null
          profissao?: string | null
          redes_sociais?: Json | null
          slug?: string | null
          stats?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vereadores_galeria: {
        Row: {
          created_at: string
          id: string
          legenda: string | null
          ordem: number | null
          url: string
          vereador_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          legenda?: string | null
          ordem?: number | null
          url: string
          vereador_id: string
        }
        Update: {
          created_at?: string
          id?: string
          legenda?: string | null
          ordem?: number | null
          url?: string
          vereador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vereadores_galeria_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vereadores_galeria_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      vereadores_mandatos: {
        Row: {
          cargo_mesa: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          mandato: string
          observacoes: string | null
          partido: string | null
          updated_at: string
          vereador_id: string
        }
        Insert: {
          cargo_mesa?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          mandato: string
          observacoes?: string | null
          partido?: string | null
          updated_at?: string
          vereador_id: string
        }
        Update: {
          cargo_mesa?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          mandato?: string
          observacoes?: string | null
          partido?: string | null
          updated_at?: string
          vereador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vereadores_mandatos_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vereadores_mandatos_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vereadores_ranking: {
        Row: {
          cargo: string | null
          foto_url: string | null
          id: string | null
          nome: string | null
          partido: string | null
          percentual_presenca: number | null
          pontuacao_total: number | null
          presencas: number | null
          total_indicacoes: number | null
          total_projetos: number | null
          total_requerimentos: number | null
          total_sessoes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sync_sessao_counters: { Args: { _sessao_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "editor"
      legislative_status:
        | "protocolado"
        | "comissao"
        | "plenario"
        | "aprovado"
        | "sancionado"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "editor"],
      legislative_status: [
        "protocolado",
        "comissao",
        "plenario",
        "aprovado",
        "sancionado",
      ],
    },
  },
} as const
