import { supabase } from '../lib/supabase';

// Типы для пользовательских вкладов
export interface UserContribution {
  id: string;
  recordId: string;
  recordName: string;
  registryNumber: string;
  type: 'image' | 'note';
  content: string;
  submittedBy?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  moderatedAt?: Date;
  moderatedBy?: string;
}

export class UserContributionsManager {
  // Получить все одобренные предложения для конкретной записи
  static async getApprovedForRecord(recordId: string): Promise<UserContribution[]> {
    const { data, error } = await supabase
      .from('user_contributions')
      .select('*')
      .eq('record_id', recordId)
      .eq('status', 'approved');
    
    if (error) {
      console.error('Ошибка загрузки вкладов:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      recordId: item.record_id,
      recordName: item.record_name,
      registryNumber: item.registry_number,
      type: item.contribution_type as 'image' | 'note',
      content: item.content,
      submittedBy: item.submitted_by,
      submittedAt: new Date(item.submitted_at),
      status: item.status as 'pending' | 'approved' | 'rejected',
      moderatedAt: item.moderated_at ? new Date(item.moderated_at) : undefined,
      moderatedBy: item.moderated_by
    }));
  }

  // Получить только одобренные изображения
  static async getApprovedImages(recordId: string): Promise<string[]> {
    const contributions = await this.getApprovedForRecord(recordId);
    return contributions
      .filter(c => c.type === 'image')
      .map(c => c.content);
  }

  // Получить только одобренные заметки
  static async getApprovedNotes(recordId: string): Promise<string[]> {
    const contributions = await this.getApprovedForRecord(recordId);
    return contributions
      .filter(c => c.type === 'note')
      .map(c => c.content);
  }

  // Добавить новое предложение
  static async submit(
    recordId: string,
    recordName: string,
    registryNumber: string,
    type: 'image' | 'note',
    content: string
  ): Promise<boolean> {
    try {
      // Получаем или создаем ID пользователя
      let userId = localStorage.getItem('heat-meter-user-id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('heat-meter-user-id', userId);
      }

      const { error } = await supabase
        .from('user_contributions')
        .insert({
          id: `contribution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          record_id: recordId,
          record_name: recordName,
          registry_number: registryNumber,
          contribution_type: type,
          content: content,
          submitted_by: userId,
          status: 'pending'
        });
      
      if (error) {
        console.error('Ошибка отправки вклада:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка отправки предложения:', error);
      return false;
    }
  }

  // Получить ожидающие модерации (для админ-панели)
  static async getPending(): Promise<UserContribution[]> {
    const { data, error } = await supabase
      .from('user_contributions')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Ошибка загрузки ожидающих:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      recordId: item.record_id,
      recordName: item.record_name,
      registryNumber: item.registry_number,
      type: item.contribution_type as 'image' | 'note',
      content: item.content,
      submittedBy: item.submitted_by,
      submittedAt: new Date(item.submitted_at),
      status: item.status as 'pending' | 'approved' | 'rejected',
      moderatedAt: item.moderated_at ? new Date(item.moderated_at) : undefined,
      moderatedBy: item.moderated_by
    }));
  }

  // Одобрить предложение
  static async approve(contributionId: string, moderatorId: string = 'admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_contributions')
        .update({
          status: 'approved',
          moderated_at: new Date().toISOString(),
          moderated_by: moderatorId
        })
        .eq('id', contributionId);
      
      if (error) {
        console.error('Ошибка одобрения:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка одобрения предложения:', error);
      return false;
    }
  }

  // Отклонить предложение
  static async reject(contributionId: string, moderatorId: string = 'admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_contributions')
        .update({
          status: 'rejected',
          moderated_at: new Date().toISOString(),
          moderated_by: moderatorId
        })
        .eq('id', contributionId);
      
      if (error) {
        console.error('Ошибка отклонения:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка отклонения предложения:', error);
      return false;
    }
  }

  // Удалить предложение
  static async delete(contributionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_contributions')
        .delete()
        .eq('id', contributionId);
      
      if (error) {
        console.error('Ошибка удаления:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка удаления предложения:', error);
      return false;
    }
  }
}
