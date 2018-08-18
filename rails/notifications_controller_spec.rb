require 'rails_helper'

RSpec.describe NotificationsController, type: :controller do
  #

  describe 'GET #show_by_criteria' do
    let(:json) { JSON.parse(response.body) }
    let!(:notification_type) { FactoryGirl.create(:notification_type, :overdue_timesheet_approval)}
    let!(:notification1) { FactoryGirl.create(:notification,
      id: 1,
      notification_type_id: 2,
      mail_count: 1,
      in_app_notification_count: 0,
      resource_id: 1000,
      resource_type: 'TIMESHEET'
    )}
    let!(:notification2) { FactoryGirl.create(:notification,
      id: 2,
      notification_type_id: 2,
      mail_count: 1,
      in_app_notification_count: 0,
      resource_id: 2000,
      resource_type: 'TIMESHEET'
    )}

    let (:user_params) do
      {
      resource_id: 1000,
      notification_type_id: 2,
      format: :json
    }
    end
    let (:user_params_array) do
      {
      resource_id: [1000, 2000],
      notification_type_id: [2],
      format: :json
    }
    end

    context 'given the parameters' do
      it 'is an array' do
        get :show_by_criteria, user_params_array
        expect(json).to_not be_empty
      end

      it 'is not an array' do
        get :show_by_criteria, user_params
        expect(json).to_not be_empty
      end
    end
  end
end
