require 'sidekiq/web'
require 'constraints/admin_constraint'


Rails.application.routes.draw do
  resources :notifications, only: [:index, :create, :update] do
    collection do
      get 'send_email'
      get 'show_by_criteria'
    end
  end

  resources :notification_types, only: [:show, :index] do
    collection do
      get 'show_by_category'
    end
  end

  resources :token, controller: 'main'
end
