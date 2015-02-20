class Study < ActiveRecord::Base
  has_many :admin_users, through: :study_owners
  has_many :study_owners

  has_many :users, through: :study_participants
  has_many :study_participants

  has_many :study_streams
  has_many :data_streams, through: :study_streams

  has_many :study_surveys
  has_many :surveys, through: :study_surveys

  accepts_nested_attributes_for :data_streams
  accepts_nested_attributes_for :surveys 

  validates :data_streams, presence: true
  validates :surveys, presence: true
  
end
