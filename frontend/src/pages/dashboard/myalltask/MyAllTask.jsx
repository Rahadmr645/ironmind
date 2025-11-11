import React, { useContext } from 'react'
import TaskCard from '../../../components/taskcard/TaskCard';
import { TaskContext } from '../../../context/TaskContext';
import './MyAllTask.css'
const MyAllTask = () => {

    const { URL, taskContainer, setTaskContainer } = useContext(TaskContext);

    return (
        <div>

            {taskContainer.length === 0 ? <p>Opps there is not Task Yet </p> :
                <div>
                    {taskContainer.map((item, index) => {

                        return (
                            <TaskCard
                                key={index}
                                created={item.createdAt}
                                desc={item.description}
                                duration={item.durationMinutes}
                                endTime={item.endTime}
                                proof={item.proof}
                                punishMent={item.punishment}
                                punishmentDuration={item.punishmentDuration}
                                reviewedByAI={item.reviewedByAI}
                                startTime={item.startTime}
                                status={item.status}
                                title={item.title}
                                id={item._id}
                                owner={item.userId}
                            />
                        )
                    })}
                </div>
            }

        </div>
    )
}

export default MyAllTask;