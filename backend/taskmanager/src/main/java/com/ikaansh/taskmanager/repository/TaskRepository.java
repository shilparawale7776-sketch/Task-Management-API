
package com.ikaansh.taskmanager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ikaansh.taskmanager.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUser_Id(Long userId);

    Optional<Task> findByIdAndUser_Id(Long id, Long userId);
}
